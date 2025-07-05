import { BadRequestException, Module } from '@nestjs/common'
import { CommonService } from './common.service'
import { CommonController } from './common.controller'
import { MulterModule } from '@nestjs/platform-express'
import { randomUUID } from 'crypto'
import { diskStorage } from 'multer'
import { join } from 'path'
import { TasksService } from './tasks.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Movie } from '../movie/entities/movie.entity'
import { DefaultLogger } from './logger/default.logger'

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'public', 'tmp'),
        filename: (_req, file, cb) => {
          cb(
            null,
            randomUUID() +
            `_${Date.now()}` +
            `.${file.mimetype.split('/').at(-1)}`,
          )
        },
      }),
      limits: {
        fileSize: 1024 * 1024 * 2,
      },
      fileFilter(_req, file, callback) {
        const allowedExt = ['jpeg', 'jpg', 'png', 'webp']
        const ext = file.mimetype.split('/').at(-1)
        if (!ext) throw new BadRequestException("잘못된 파일입니다.")
        if (!allowedExt.includes(ext)) {
          return callback(
            new BadRequestException(
              `그림 파일 확장자는 ${allowedExt.join('/')}만 가능합니다.`,
            ),
            false,
          )
        } else return callback(null, true)
      },
    }),
    TypeOrmModule.forFeature([Movie]),
  ],
  controllers: [CommonController],
  providers: [CommonService, TasksService, DefaultLogger],
  exports: [CommonService],
})
export class CommonModule { }
