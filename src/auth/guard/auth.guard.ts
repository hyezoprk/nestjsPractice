import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Public } from '../decorator/public.decorator'
import { RequestWithUser } from '../middleware/bearer-token.middleware'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest() satisfies RequestWithUser & { isPublic: boolean }

    const isPublic = this.reflector.get(Public, context.getHandler())

    if (isPublic) return true

    if (!req.user || req.user.type !== 'access') {
      throw new ForbiddenException('로그인이 필요합니다.')
    }

    return true
  }
}
