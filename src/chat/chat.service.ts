import { Injectable } from '@nestjs/common'
import { Socket } from 'socket.io'
import { Repository } from 'typeorm'
import { ChatRoom } from './entities/chat-room.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Chat } from './entities/chat.entity'
import { Role, User } from 'src/user/entities/user.entity'
import { QueryRunner } from 'typeorm/browser'
import { WsException } from '@nestjs/websockets'
import { CreateChatDto } from './dto/create-chat.dto'

@Injectable()
export class ChatService {
  private readonly connectedClients = new Map<number, Socket>()
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  registerClient(userId: number, client: Socket) {
    this.connectedClients.set(userId, client)
  }

  removeClient(userId: number) {
    this.connectedClients.delete(userId)
  }

  async joinUserRooms(userId: number, client: Socket) {
    const chatRooms = await this.chatRoomRepository
      .createQueryBuilder('chatRoom')
      .innerJoin('chatRoom.users', 'user', 'user.id=:userId', {
        userId,
      })
      .getMany()

    chatRooms.forEach((room) => {
      client.join(room.id.toString())
    })
  }

  async createMessage(userId: number, dto: CreateChatDto, qr: QueryRunner) {
    const user = await this.userRepository.findOneBy({ id: userId })
    if (!user) throw new WsException('로그인 하지 않았습니다')

    const { message, room } = dto

    try {
      const chatRoom = await this.getOrCreateChatRoom(user, qr, room)
      if (!chatRoom) throw new WsException('채팅방을 찾을 수 없습니다')

      const msgModel = qr.manager.create(Chat, {
        author: user,
        message,
        chatRoom,
      })
      const messageToSend = await qr.manager.save(msgModel)

      const client = this.connectedClients.get(userId)
      client?.to(chatRoom.id.toString()).emit('newMessage', messageToSend)

      return messageToSend
    } catch (e) {
      console.error(e)
      throw new WsException('메세지 전송에 실패했습니다.')
    }
  }

  async getOrCreateChatRoom(user: User, qr: QueryRunner, room?: number) {
    if (user.role === Role.ADMIN) {
      if (!room) {
        throw new WsException('어드민은 Room값을 필수로 제공해야 합니다.')
      }

      return qr.manager.findOne(ChatRoom, {
        where: { id: room },
        relations: ['users'],
      })
    }

    let chatRoom = await qr.manager
      .createQueryBuilder(ChatRoom, 'chatRoom')
      .innerJoin('chatRoom.users', 'user')
      .where('user.id=:userId', { userId: user.id })
      .getOne()

    if (!chatRoom) {
      const adminUser = await qr.manager.findOne(User, {
        where: { role: Role.ADMIN },
      })
      if (!adminUser) throw new WsException('어드민 유저를 찾을 수 없습니다')

      const chatRoomObj = this.chatRoomRepository.create({
        users: [user, adminUser],
      })

      chatRoom = await this.chatRoomRepository.save(chatRoomObj)

      const targetIds = [(user.id, adminUser.id)]

      targetIds.forEach((userId: number) => {
        const client = this.connectedClients.get(userId)

        if (client && chatRoom) {
          client.emit('roomCreated', chatRoom.id)
          client.join(chatRoom.id.toString())
        }
      })
    }

    return chatRoom
  }
}
