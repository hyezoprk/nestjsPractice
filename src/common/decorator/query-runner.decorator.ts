import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common'
import { QueryRunner } from 'typeorm'

export const QR = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest()

    if (!req || !req.queryRunner) {
      throw new InternalServerErrorException(
        'QueryRunner 객체를 찾을 수 없습니다',
      )
    }

    return req.qr satisfies QueryRunner
  },
)
