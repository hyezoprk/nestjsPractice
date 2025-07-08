import { Column, Entity, OneToOne } from 'typeorm'
import { BaseTable } from '../../common/entities/base-table.entity'
import { Movie } from './movie.entity'

@Entity()
export class MovieDetail extends BaseTable {
  @Column()
  detail: string

  @OneToOne(() => Movie, (movie) => movie.detail)
  movie: Movie
}
