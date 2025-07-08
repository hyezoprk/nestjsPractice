import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common'
import { QueryRunner } from 'typeorm'

export const WsQR = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient()

    if (!client || !client.data.qr) {
      throw new InternalServerErrorException(
        'QueryRunner 객체를 찾을 수 없습니다',
      )
    }

    return client.data.qr satisfies QueryRunner
  },
)
