import { BaseTable } from 'src/common/entities/base-table.entity'
import { User } from 'src/user/entities/user.entity'
import { Column, Entity, ManyToOne } from 'typeorm'
import { ChatRoom } from './chat-room.entity'
import { Type } from 'class-transformer'

@Entity()
export class Chat extends BaseTable {
  @ManyToOne(() => User, (user) => user.chats)
  @Type(() => User)
  author: User

  @Column()
  message: string

  @ManyToOne(() => ChatRoom, (chatroom) => chatroom.chats)
  chatroom: ChatRoom
}
