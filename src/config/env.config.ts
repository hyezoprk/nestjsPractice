import { ConfigService } from '@nestjs/config'
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm'
import * as Joi from 'joi'
import { ENV } from 'src/common/const/env.const'
import { Director } from 'src/director/entities/director.entity'
import { Genre } from 'src/genre/entities/genre.entity'
import { MovieDetail } from 'src/movie/entities/movie-detail.entity'
import { MovieUserLike } from 'src/movie/entities/movie-user-like.entity'
import { Movie } from 'src/movie/entities/movie.entity'
import { User } from 'src/user/entities/user.entity'

export const joiEnvConfig = Joi.object({
  ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  TYPE: Joi.string().valid('postgres').required(),
  HOST: Joi.string().required(),
  PORT: Joi.number().required(),
  USERNAME: Joi.string().required(),
  PASSWORD: Joi.string().required(),
  DATABASE: Joi.string().required(),
  HASH_ROUNDS: Joi.number().required(),
  ACCESS_TOKEN_SECRET: Joi.string().required(),
  REFRESH_TOKEN_SECRET: Joi.string().required(),
})

export const databaseEnvConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: configService.get<string>(ENV.TYPE) as 'postgres',
    host: configService.get<string>(ENV.HOST),
    port: configService.get<number>(ENV.PORT),
    username: configService.get<string>(ENV.USERNAME),
    password: configService.get<string>(ENV.PASSWORD),
    database: configService.get<string>(ENV.DATABASE),
    // TODO: 엔티티 추가될 때마다 잊지 않기
    entities: [Movie, MovieDetail, Director, Genre, User, MovieUserLike],
    // TODO: 프로덕션에서 사용하는 경우 false로 반드시 변경
    synchronize: true,
  }),
}
