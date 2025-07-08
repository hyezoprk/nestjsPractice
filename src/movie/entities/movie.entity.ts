import { Director } from 'src/director/entities/director.entity'
import { Genre } from 'src/genre/entities/genre.entity'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm'
import { BaseTable } from '../../common/entities/base-table.entity'
import { MovieDetail } from './movie-detail.entity'
import { Transform } from 'class-transformer'
import { User } from 'src/user/entities/user.entity'
import { MovieUserLike } from './movie-user-like.entity'

@Entity()
export class Movie extends BaseTable {
  @Column()
  title: string

  @ManyToOne(() => User, (user) => user.createdMovie)
  creator: User

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.movie, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn()
  detail: MovieDetail

  @ManyToOne(() => Director, (director) => director.movies, {
    cascade: true,
    nullable: false,
  })
  director: Director

  @ManyToMany(() => Genre, (genre) => genre.movies, {
    cascade: true,
  })
  genres: Genre[]

  @Column({
    type: 'text',
    nullable: true,
    default: null,
  })
  @Transform(({ value }) => `http://localhost:3000/${value}`)
  movieFilePath: string | null

  @OneToMany(() => MovieUserLike, (mul) => mul.movie)
  likedUsers: MovieUserLike[]

  @Column({
    default: 0,
  })
  likeCount: number

  @Column({
    default: 0,
  })
  dislikeCount: number
}
