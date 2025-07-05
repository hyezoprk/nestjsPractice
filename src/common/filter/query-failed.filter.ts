import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { QueryFailedError } from 'typeorm'

@Catch(QueryFailedError)
export class QueryFailedExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse()
    const req = ctx.getRequest()
    const status = 400

    let message = '데이터베이스 에러 발생'
    console.log(`[400 Bad Request] / ${req.method} ${req.url}`)

    if (exception.message.includes('duplicate key')) {
      message = '중복된 키가 존재합니다.'
    }

    res.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      message,
      originalMessage: exception.message,
    })
  }
}
