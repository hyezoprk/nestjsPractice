import { BaseTable } from 'src/common/entities/base-table.entity'
import { Movie } from 'src/movie/entities/movie.entity'
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm'

@Entity()
export class Genre extends BaseTable {
  @Column({
    unique: true,
  })
  name: string

  @ManyToMany(() => Movie, (movie) => movie.genres)
  @JoinTable()
  movies: Movie[]
}
