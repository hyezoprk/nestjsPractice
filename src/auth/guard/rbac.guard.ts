import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Role } from 'src/user/entities/user.entity'
import { Public } from '../decorator/public.decorator'
import { RBAC } from '../decorator/rbac.decorator'
import { RequestWithUser } from '../middleware/bearer-token.middleware'

@Injectable()
export class RBACGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const isPublic = this.reflector.get(Public, context.getHandler())
    if (isPublic) return true

    let role = this.reflector.get<Role>(RBAC, context.getHandler())
    if (role === undefined) {
      role = Role.USER
    }

    if (!Object.values(Role).includes(role))
      throw new UnauthorizedException('부적절한 권한입니다.')

    const req = context.switchToHttp().getRequest() satisfies RequestWithUser
    if (!req.user) throw new UnauthorizedException('로그인이 필요합니다.')

    return req.user.role <= role
  }
}
