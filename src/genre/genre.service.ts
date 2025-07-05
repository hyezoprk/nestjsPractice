import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateGenreDto } from './dto/create-genre.dto'
import { UpdateGenreDto } from './dto/update-genre.dto'
import { Genre } from './entities/genre.entity'

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  findAll() {
    return this.genreRepository.find()
  }

  findOne(id: number) {
    return this.genreRepository.findOneBy({ id })
  }

  async create(createGenreDto: CreateGenreDto) {
    const genre = await this.genreRepository.findOneBy({
      name: createGenreDto.name,
    })
    if (genre) throw new NotFoundException('이미 존재하는 장르입니다')

    return this.genreRepository.save(createGenreDto)
  }

  async update(id: number, updateGenreDto: UpdateGenreDto) {
    const genre = await this.findOne(id)
    if (!genre) throw new NotFoundException('해당하는 장르를 찾을 수 없습니다.')

    await this.genreRepository.update(id, updateGenreDto)

    const newGenre = await this.findOne(id)

    return newGenre
  }

  async remove(id: number) {
    const genre = await this.findOne(id)
    if (!genre) throw new NotFoundException('해당하는 장르를 찾을 수 없습니다.')

    return this.genreRepository.delete(id)
  }
}
