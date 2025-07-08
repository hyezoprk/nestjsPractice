import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  Req,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { Public } from './decorator/public.decorator'
import { type RequestWithUser } from './middleware/bearer-token.middleware'
import { LocalAuthGuard } from './strategy/local.strategy'
import { ApiBasicAuth, ApiBearerAuth } from '@nestjs/swagger'
import { Authorization } from './decorator/auth.decorator'

@Controller('auth')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @ApiBasicAuth()
  async signUp(@Authorization() token: string) {
    return await this.authService.register(token)
  }

  @Post('signin')
  @Public()
  @ApiBasicAuth()
  async signIn(@Authorization() token: string) {
    return await this.authService.signIn(token)
  }

  @Post('token/block')
  @Public()
  blockToken(@Body('token') token: string) {
    return this.authService.tokenBlock(token)
  }

  @Post('token/access')
  rotateAccessToken(@Req() req: RequestWithUser & { accessToken: string }) {
    return req.accessToken
  }

  @UseGuards(LocalAuthGuard)
  @Post('login/passport')
  loginUserPassport(@Request() req: RequestWithUser) {
    return req.user
  }
}
