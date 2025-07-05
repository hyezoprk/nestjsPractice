import { BaseTable } from 'src/common/entities/base-table.entity';
import { Movie } from 'src/movie/entities/movie.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Director extends BaseTable {
  @Column()
  name: string;

  @Column()
  bod: Date;

  @Column()
  nationality: string;

  @OneToMany(() => Movie, (movie) => movie.director)
  movies: Movie[];
}
