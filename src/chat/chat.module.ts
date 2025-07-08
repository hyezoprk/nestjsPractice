import { Module } from '@nestjs/common'
import { ChatService } from './chat.service'
import { ChatGateway } from './chat.gateway'
import { AuthModule } from 'src/auth/auth.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChatRoom } from './entities/chat-room.entity'
import { User } from 'src/user/entities/user.entity'
import { Chat } from './entities/chat.entity'

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([ChatRoom, Chat, User])],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
