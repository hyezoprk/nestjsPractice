import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommonModule } from 'src/common/common.module'
import { Director } from 'src/director/entities/director.entity'
import { Genre } from 'src/genre/entities/genre.entity'
import { MovieDetail } from './entities/movie-detail.entity'
import { Movie } from './entities/movie.entity'
import { MovieController } from './movie.controller'
import { MovieService } from './movie.service'
import { User } from 'src/user/entities/user.entity'
import { MovieUserLike } from './entities/movie-user-like.entity'

@Module({
  controllers: [MovieController],
  providers: [MovieService],
  imports: [
    TypeOrmModule.forFeature([
      Movie,
      MovieDetail,
      Director,
      Genre,
      User,
      MovieUserLike,
    ]),
    CommonModule,
  ],
})
export class MovieModule {}
