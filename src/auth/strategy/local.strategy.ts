import { Injectable } from '@nestjs/common'
import { AuthGuard, PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { AuthService } from '../auth.service'

export class LocalAuthGuard extends AuthGuard('hyezo') {}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'hyezo') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    })
  }

  async validate(email: string, password: string) {
    const user = await this.authService.authenticate(email, password)

    return user
  }
}
