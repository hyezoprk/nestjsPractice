import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common'
import { randomUUID } from 'crypto'
import { rename } from 'fs/promises'
import { join } from 'path'

@Injectable()
export class MovieFilePipe
  implements PipeTransform<Express.Multer.File, Promise<Express.Multer.File>> {
  constructor(
    private readonly options: { maxSize: number; allowedExt: string[] },
  ) { }

  async transform(
    file: Express.Multer.File,
    _metadata: ArgumentMetadata,
  ): Promise<Express.Multer.File> {
    if (!file) throw new BadRequestException('파일을 업로드해주세요.')

    const byteSize = this.options.maxSize * 1024 * 1024
    const ext = file.mimetype.split('/').at(-1)
    if (!ext) throw new BadRequestException("잘못된 파일입니다.")

    if (file.size > byteSize) {
      throw new BadRequestException(
        `파일 크기가 ${byteSize / 1024 / 1024}MB 이하여야 합니다.`,
      )
    }

    if (!this.options.allowedExt.includes(ext)) {
      const allowedMimeType = this.options.allowedExt.join('/')

      throw new BadRequestException(
        `파일 확장자가 ${allowedMimeType}여야 합니다.`,
      )
    }

    const filename = randomUUID() + `_${Date.now()}` + `.${ext}`
    const newPath = join(process.cwd(), 'public', 'movie', filename)
    await rename(file.path, newPath)

    return {
      ...file,
      filename,
      path: newPath,
    }
  }
}
