import { BaseTable } from 'src/common/entities/base-table.entity'
import { User } from 'src/user/entities/user.entity'
import { Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm'
import { Chat } from './chat.entity'

@Entity()
export class ChatRoom extends BaseTable {
  @ManyToMany(() => User, (user) => user.chatrooms)
  @JoinTable()
  users: User[]

  @OneToMany(() => Chat, (chat) => chat.chatroom)
  chats: Chat[]
}
