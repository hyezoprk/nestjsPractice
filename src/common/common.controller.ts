import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth } from '@nestjs/swagger'
import { RBAC } from 'src/auth/decorator/rbac.decorator'
import { Role } from 'src/user/entities/user.entity'

@Controller('common')
@ApiBearerAuth()
export class CommonController {
  @Post('video')
  @RBAC(Role.USER)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 1024 * 1024 * 2,
      },
    }),
  )
  createVideo(@UploadedFile() movie: Express.Multer.File) {
    return {
      filename: movie.filename,
    }
  }
}
