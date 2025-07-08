import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService, TokenExpiredError } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { compare, hash } from 'bcrypt'
import { ENV } from 'src/common/const/env.const'
import { Role, User } from 'src/user/entities/user.entity'
import { UserService } from 'src/user/user.service'
import { Repository } from 'typeorm'

export interface TokenPayload {
  sub: number
  role: Role
  type: 'access' | 'refresh'
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  parseToken(rawToken: string, tokenType: 'basic' | 'bearer') {
    const splitToken = rawToken.split(' ')

    if (splitToken.length !== 2 || tokenType !== splitToken[0].toLowerCase())
      throw new BadRequestException('잘못된 토큰입니다.')

    const [_, token] = splitToken

    const decoded = atob(token)
    const [email, password] =
      decoded.split(':').length === 2
        ? decoded.split(':')
        : [undefined, undefined]

    if (!email || !password)
      throw new BadRequestException('잘못된 로그인 정보입니다')

    return { email, password }
  }

  async parseBearerToken(rawToken: string) {
    const splitToken = rawToken.split(' ')

    if (splitToken.length !== 2 || splitToken[0].toLowerCase() !== 'bearer')
      throw new BadRequestException('잘못된 Bearer 토큰입니다.')

    const [_, token] = splitToken

    return token
  }

  async verifyToken(token: string) {
    try {
      const decodedToken = this.jwtService.decode<TokenPayload>(token)
      const checkTokenType =
        decodedToken.type === 'access'
          ? ENV.ACCESS_TOKEN_SECRET
          : ENV.REFRESH_TOKEN_SECRET

      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.configService.get<string>(checkTokenType),
      })

      return payload
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new BadRequestException(
          '토큰이 만료되었습니다. 다시 로그인해주세요.',
        )
      }
    }
  }

  async register(token: string) {
    const { email, password } = this.parseToken(token, 'basic')

    return await this.userService.create({ email, password })
  }

  async hashPassword(password: string) {
    const salt = this.configService.get<number>('HASH_ROUNDS')
    if (typeof salt !== 'number') {
      throw new InternalServerErrorException(
        'HASH_ROUNDS 환경변수가 설정되지 않았습니다.',
      )
    }
    return await hash(password, salt)
  }

  async authenticate(email: string, password: string) {
    const user = await this.userRepository.findOneBy({ email })
    if (!user) throw new BadRequestException('잘못된 로그인 정보입니다')

    const passOk = await compare(password, user.password)
    if (!passOk) throw new BadRequestException('잘못된 로그인 정보입니다')

    return user
  }

  async signIn(rawToken: string) {
    const { email, password } = this.parseToken(rawToken, 'basic')
    const user = await this.authenticate(email, password)

    return {
      accessToken: await this.jwtService.signAsync(
        { sub: user.id, role: user.role, type: 'access' },
        {
          secret: this.configService.get<string>(ENV.ACCESS_TOKEN_SECRET),
          expiresIn: '1h',
        },
      ),
      refreshToken: await this.jwtService.signAsync(
        { sub: user.id, role: user.role, type: 'refresh' },
        {
          secret: this.configService.get<string>(ENV.REFRESH_TOKEN_SECRET),
          expiresIn: '1d',
        },
      ),
    }
  }

  async issueToken(token: TokenPayload, type: 'access' | 'refresh') {
    const payload = { sub: token.sub, role: token.role, type }
    const secret = this.configService.get<string>(
      type === 'access' ? ENV.ACCESS_TOKEN_SECRET : ENV.REFRESH_TOKEN_SECRET,
    )

    return await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: type === 'access' ? '1h' : '1d',
    })
  }

  async tokenBlock(token: string) {
    const payload = this.jwtService.decode(token)
    const expDate = new Date(payload['exp'] * 1000),
      now = Date.now(),
      diffTime = (expDate.getTime() - now) / 1000

    await this.cacheManager.set(
      `BLOCK_TOKEN_${token}`,
      payload,
      // 실제 토큰의 유효기간보다 살짝 빨리 만료되게 설정
      Math.max((diffTime - 30) * 1000, 1),
    )

    return true
  }
}
