import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { join } from 'path'
import { CommonService } from 'src/common/common.service'
import { Director } from 'src/director/entities/director.entity'
import { Genre } from 'src/genre/entities/genre.entity'
import { In, QueryRunner, Repository } from 'typeorm'
import { CreateMovieDto } from './dto/create-movie.dto'
import { GetMoviesDto } from './dto/get-movies.dto'
import { UpdateMovieDto } from './dto/update-movie.dto'
import { MovieDetail } from './entities/movie-detail.entity'
import { Movie } from './entities/movie.entity'
import { rename } from 'fs/promises'
import { User } from 'src/user/entities/user.entity'
import { MovieUserLike } from './entities/movie-user-like.entity'
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MovieUserLike)
    private readonly movieUserLikeRepository: Repository<MovieUserLike>,
    private readonly commonService: CommonService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async createMovie(
    createMovieDto: CreateMovieDto,
    userId: number,
    qr: QueryRunner,
  ) {
    const { detail, directorId, genreIds, movieFileName, ...restDto } =
      createMovieDto

    const director = await this.directorRepository.findOneBy({ id: directorId })
    if (!director)
      throw new NotFoundException('해당하는 감독을 찾을 수 없습니다.')

    const genres = await this.genreRepository.findBy({ id: In(genreIds) })
    if (genres.length !== genreIds.length)
      throw new NotFoundException('해당하는 장르를 찾을 수 없습니다.')

    console.log(qr)
    const movieDetail = await qr.manager
      .createQueryBuilder()
      .insert()
      .into(MovieDetail)
      .values({ detail })
      .execute()
    const movieDetailId = movieDetail.identifiers[0].id

    const movieFolder = join('public', 'movie')
    const tmpFolder = join('public', 'tmp')

    const movie = await qr.manager
      .createQueryBuilder()
      .insert()
      .into(Movie)
      .values({
        ...restDto,
        director,
        detail: { id: movieDetailId },
        movieFilePath: join(movieFolder, movieFileName),
        creator: {
          id: userId,
        },
      })
      .execute()
    const movieId = movie.identifiers[0].id

    await qr.manager
      .createQueryBuilder()
      .relation(Movie, 'genres')
      .of(movieId)
      .add(genres.map((g) => g.id))

    await rename(
      join(process.cwd(), tmpFolder, movieFileName),
      join(process.cwd(), movieFolder, movieFileName),
    )

    return await qr.manager.findOne(Movie, {
      where: { id: movieId },
      relations: ['detail', 'director', 'genres'],
    })
  }

  async getMovieById(id: number) {
    const repo = this.movieRepository
    const movie = await repo.findOne({
      where: { id },
      relations: ['detail', 'director', 'genres'],
    })

    if (!movie) {
      throw new NotFoundException('해당하는 영화를 찾을 수 없습니다.')
    }

    return movie
  }

  async getMovies(dto: GetMoviesDto, userId?: number) {
    const { title } = dto

    const qb = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres')
      .leftJoinAndSelect('movie.detail', 'detail')
      .leftJoinAndSelect('movie.creator', 'creator')

    if (title) {
      qb.where('movie.title LIKE :title', { title: `${title}%` })
    }

    const { nextCursor } =
      await this.commonService.applyCursorPaginationParamsToQb(qb, dto)

    let [data, total] = await qb.getManyAndCount()

    if (userId) {
      const movieIds = data.map((m) => m.id)
      const likedMovies =
        movieIds.length < 1
          ? []
          : await this.movieUserLikeRepository
              .createQueryBuilder('mul')
              .leftJoinAndSelect('mul.user', 'user')
              .leftJoinAndSelect('mul.movie', 'movie')
              .where('movie.id IN(:...movieIds)', { movieIds })
              .andWhere('user.id = :userId', { userId })
              .getMany()

      const likedMovieMap: Record<string, boolean> = likedMovies.reduce(
        (acc, each) => ({
          ...acc,
          [each.movie.id]: each.isLike,
        }),
        {},
      )

      data = data.map((x) => ({
        ...x,
        likedStatus: x.id in likedMovieMap ? likedMovieMap[x.id] : null,
      }))
    }

    return { data, total, nextCursor }
  }

  async updateMovie(id: number, updateMovieDto: UpdateMovieDto) {
    const repo = this.movieRepository
    const { detail, directorId, genreIds, ...restDto } = updateMovieDto
    let genres = null,
      newDirector = null

    if (directorId) {
      const director = await this.directorRepository.findOneBy({
        id: directorId,
      })

      if (!director)
        throw new NotFoundException('해당하는 감독을 찾을 수 없습니다.')

      newDirector = director
    }

    if (genreIds) {
      genres = await this.genreRepository.findBy({ id: In(genreIds) })
      if (genres.length !== genreIds.length)
        throw new NotFoundException(
          `존재하지 않는 장르가 있습니다. ${genres.map((g) => g.name).join(', ')}`,
        )
    }

    const movieUpdateFileds = {
      ...restDto,
      ...(newDirector && { director: newDirector }),
      ...(genres?.length && { genres }),
    }

    const updatedMovie = await repo.preload({
      id,
      ...movieUpdateFileds,
    })

    if (!updatedMovie)
      throw new NotFoundException('해당하는 영화를 찾을 수 없습니다.')

    await repo.save(updatedMovie)
    const movie = await repo.findOne({
      where: { id },
      relations: ['detail', 'director', 'genres'],
    })

    if (detail) {
      await this.movieDetailRepository.update(
        { id: movie?.detail.id },
        { detail },
      )
    }

    return movie
  }

  async deleteMovie(id: number) {
    const repo = this.movieRepository
    const detailRepo = this.movieDetailRepository

    const movie = await repo.findOneBy({ id })
    if (!movie) throw new NotFoundException('해당하는 영화를 찾을 수 없습니다.')

    await repo.delete(id)
    await detailRepo.delete(movie.detail.id)

    return `This action removes a #${id} movie`
  }

  async checkExists(id: number) {
    const repo = this.movieRepository
    const doesExists = await repo.exists({ where: { id } })
    if (!doesExists) {
      throw new NotFoundException('해당하는 영화를 찾을 수 없습니다.')
    }

    return true
  }

  async toggleMovieLike(movieId: number, userId: number, isLike: boolean) {
    const movie = await this.movieRepository.findOneBy({ id: movieId })
    if (!movie) throw new BadRequestException('영화를 찾을 수 없습니다')

    const user = await this.userRepository.findOneBy({ id: userId })
    if (!user) throw new UnauthorizedException('로그인 정보를 찾을 수 없습니다')

    const likeRecord = await this.movieUserLikeRepository
      .createQueryBuilder('mul')
      .leftJoinAndSelect('mul.movie', 'movie')
      .leftJoinAndSelect('mul.user', 'user')
      .where('movie.id = :movieId', { movieId })
      .andWhere('user.id =:userId', { userId })
      .getOne()

    if (likeRecord) {
      if (isLike === likeRecord.isLike) {
        await this.movieUserLikeRepository.delete({ movie, user })
      } else {
        await this.movieUserLikeRepository.update({ movie, user }, { isLike })
      }
    } else {
      await this.movieUserLikeRepository.save({ movie, user, isLike })
    }

    const result = await this.movieUserLikeRepository
      .createQueryBuilder('mul')
      .leftJoinAndSelect('mul.movie', 'movie')
      .leftJoinAndSelect('mul.user', 'user')
      .where('movie.id = :movieId', { movieId })
      .andWhere('user.id =:userId', { userId })
      .getOne()

    return {
      isLike: result && result.isLike,
    }
  }

  async findRecent() {
    const cachedData = await this.cacheManager.get('recent')

    if (!cachedData) {
      const data = await this.movieRepository.find({
        order: {
          createdAt: 'DESC',
        },
        take: 10,
      })

      await this.cacheManager.set('recent', data)

      return data
    } else return cachedData
  }
}
