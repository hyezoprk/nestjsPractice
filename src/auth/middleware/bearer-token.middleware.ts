import {
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { AuthService, TokenPayload } from '../auth.service'
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'

export interface RequestWithUser extends Request {
  user: TokenPayload
}

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) { }

  async use(
    req: RequestWithUser & { accessToken: string },
    _res: Response,
    next: NextFunction,
  ) {
    const authHeader = req.headers.authorization
    if (!authHeader) return next()

    const token = await this.authService.parseBearerToken(authHeader)

    const blockedToken = await this.cacheManager.get(`BLOCK_TOKEN_${token}`)
    if (blockedToken) throw new UnauthorizedException('차단된 토큰입니다.')

    const tokenAsKey = `Token ${token}`
    const cachedToken = await this.cacheManager.get<TokenPayload>(tokenAsKey)

    if (cachedToken) {
      req.user = cachedToken
      return next()
    } else {
      const payload = await this.authService.verifyToken(token)
      if (!payload) throw new UnauthorizedException("잘못된 토큰입니다")

      const accessToken = await this.authService.issueToken(payload, 'access')

      req.user = payload
      req.accessToken = accessToken
      next()
    }
  }
}
