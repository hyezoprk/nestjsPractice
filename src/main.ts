import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import ffmpeg from '@ffmpeg-installer/ffmpeg'
import * as ffmpegFluent from 'fluent-ffmpeg'
import * as ffprobe from 'ffprobe-static'

ffmpegFluent.setFfmpegPath(ffmpeg.path)
ffmpegFluent.setFfprobePath(ffprobe.path)

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const config = new DocumentBuilder()
      .setTitle('넷플릭스')
      .setDescription('Code Factory')
      .setVersion('1.0')
      .addBasicAuth()
      .addBearerAuth()
      .build(),
    document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('doc', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        // DTO의 타입스크립트 값을 기반으로 값을 변경
        enableImplicitConversion: true,
      },
    }),
  )
  await app.listen(3000)
}
bootstrap()
