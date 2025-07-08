import { Exclude } from 'class-transformer'
import { ChatRoom } from 'src/chat/entities/chat-room.entity'
import { Chat } from 'src/chat/entities/chat.entity'
import { BaseTable } from 'src/common/entities/base-table.entity'
import { MovieUserLike } from 'src/movie/entities/movie-user-like.entity'
import { Movie } from 'src/movie/entities/movie.entity'
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm'

export enum Role {
  ADMIN,
  PAIDUSER,
  USER,
}

@Entity()
export class User extends BaseTable {
  @Column({
    unique: true,
  })
  email: string

  @Column()
  @Exclude({
    toPlainOnly: true,
  })
  password: string

  @Column({
    default: Role.USER,
  })
  role: number

  @OneToMany(() => Movie, (movie) => movie.creator)
  createdMovie: Movie[]

  @OneToMany(() => MovieUserLike, (mul) => mul.user)
  likedMovies: MovieUserLike[]

  @OneToMany(() => Chat, (chat) => chat.author)
  chats: Chat[]

  @ManyToMany(() => ChatRoom, (chatrooms) => chatrooms.users)
  chatrooms: ChatRoom[]
}
