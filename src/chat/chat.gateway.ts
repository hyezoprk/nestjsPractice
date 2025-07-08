import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { AuthService, TokenPayload } from 'src/auth/auth.service'
import { ChatService } from './chat.service'
import { BadGatewayException, UseInterceptors } from '@nestjs/common'
import { WsTransactionInterceptor } from 'src/common/interceptor/ws-transaction.interceptor'
import { WsQR } from 'src/common/decorator/ws-query-runner.decorator'
import { type QueryRunner } from 'typeorm'
import { CreateChatDto } from './dto/create-chat.dto'

interface SocketWithUser extends Socket {
  data: {
    user: TokenPayload
  }
}

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {}

  handleDisconnect(client: Socket) {
    const userId = client.data.user.sub
    if (userId) {
      this.chatService.removeClient(userId)
    }
  }

  async handleConnection(client: Socket, ..._args: any[]) {
    try {
      const rawToken = client.handshake.headers.authorization
      if (!rawToken)
        throw new BadGatewayException('jwt 토큰이 적절하지 않습디다')

      const token = await this.authService.parseBearerToken(rawToken)
      const payload = await this.authService.verifyToken(token)

      if (payload) {
        client.data.user = payload
        const userId = payload.sub
        this.chatService.registerClient(userId, client)
        await this.chatService.joinUserRooms(userId, client)
      } else {
        client.disconnect()
      }
    } catch (e) {
      client.disconnect()
      console.error(e)
    }
  }

  @SubscribeMessage('sendMessage')
  @UseInterceptors(WsTransactionInterceptor)
  async handleMessage(
    @MessageBody() dto: CreateChatDto,
    @ConnectedSocket() client: SocketWithUser,
    @WsQR() qr: QueryRunner,
  ) {
    const userId = client.data.user.sub

    await this.chatService.createMessage(userId, dto, qr)
  }
}
