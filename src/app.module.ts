import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { TypeOrmModule } from '@nestjs/typeorm'
import { join } from 'path'
import { AuthModule } from './auth/auth.module'
import { BearerTokenMiddleware } from './auth/middleware/bearer-token.middleware'
import { databaseEnvConfig, joiEnvConfig } from './config/env.config'
import { providers } from './config/global-providers.config'
import { DirectorModule } from './director/director.module'
import { GenreModule } from './genre/genre.module'
import { MovieModule } from './movie/movie.module'
import { UserModule } from './user/user.module'
import { CacheModule } from '@nestjs/cache-manager'
import { ScheduleModule } from '@nestjs/schedule'
import { WinstonModule } from 'nest-winston'
import * as winston from 'winston'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joiEnvConfig,
    }),
    TypeOrmModule.forRootAsync(databaseEnvConfig),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/public',
    }),
    ScheduleModule.forRoot(),
    WinstonModule.forRoot({
      level: 'verbose',
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize({
              all: true,
            }),
            winston.format.timestamp(),
            winston.format.printf(
              info => `${info.timestamp} [${info.context}] ${info.level} ${info.message}`
            )
          )
        }),
        new winston.transports.File({
          dirname: join(process.cwd(), 'logs'),
          filename: 'logs.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(
              info => `${info.timestamp} [${info.context}] ${info.level} ${info.message}`
            )
          )
        })
      ],
    }),
    MovieModule,
    DirectorModule,
    GenreModule,
    AuthModule,
    UserModule,
    CacheModule.register({ ttl: 0, isGlobal: true }),
  ],
  providers,
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BearerTokenMiddleware)
      .exclude({ path: 'auth/signin', method: RequestMethod.POST })
      .exclude({ path: 'auth/register', method: RequestMethod.POST })
      .forRoutes('*')
  }
}
