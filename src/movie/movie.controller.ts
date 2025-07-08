import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common'
import { Public } from 'src/auth/decorator/public.decorator'
import { RBAC } from 'src/auth/decorator/rbac.decorator'
import { QR } from 'src/common/decorator/query-runner.decorator'
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor'
import { Role } from 'src/user/entities/user.entity'
import { type QueryRunner } from 'typeorm'
import { CreateMovieDto } from './dto/create-movie.dto'
import { GetMoviesDto } from './dto/get-movies.dto'
import { UpdateMovieDto } from './dto/update-movie.dto'
import { UserId } from 'src/user/decorator/user-id.decorator'
import { MovieService } from './movie.service'
import { CacheKey, CacheInterceptor as CI } from '@nestjs/cache-manager'
import { Throttle } from 'src/common/decorator/throttle.decorator'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'

@Controller('movie')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @Public()
  @Throttle({
    count: 5,
    unit: 'minute',
  })
  @ApiOperation({
    description: 'Movie[]를 Pagination 하는 API',
  })
  @ApiResponse({
    status: 200,
    description: '페이지네이션을 성공적으로 받았을 때',
  })
  getMovies(@Query() dto: GetMoviesDto, @UserId() userId?: number) {
    return this.movieService.getMovies(dto, userId)
  }

  @Get('recent')
  @Public()
  @UseInterceptors(CI)
  @CacheKey('getRecentMovies')
  getRecentMovies() {
    console.log('GetRecentMovies 실행')
    return this.movieService.findRecent()
  }

  @Get(':id')
  @Public()
  getMovie(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.getMovieById(id)
  }

  @Post()
  @RBAC(Role.ADMIN)
  @UseInterceptors(TransactionInterceptor)
  postMovie(
    @Body() createMovieDto: CreateMovieDto,
    @UserId() userId: number,
    @QR() qr: QueryRunner,
  ) {
    console.log('???')
    return this.movieService.createMovie(createMovieDto, userId, qr)
  }

  @Patch(':id')
  updateMovie(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMovieDto: UpdateMovieDto,
  ) {
    return this.movieService.updateMovie(id, updateMovieDto)
  }

  @Delete(':id')
  @RBAC(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.deleteMovie(id)
  }

  @Post(':id/like')
  createMovieLike(
    @Param('id', ParseIntPipe) movieId: number,
    @UserId() userId: number,
  ) {
    return this.movieService.toggleMovieLike(movieId, userId, true)
  }

  @Post(':id/dislike')
  createMoviedisLike(
    @Param('id', ParseIntPipe) movieId: number,
    @UserId() userId: number,
  ) {
    return this.movieService.toggleMovieLike(movieId, userId, false)
  }
}
