import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common'
import { catchError, Observable, tap } from 'rxjs'
import { DataSource } from 'typeorm'

@Injectable()
export class WsTransactionInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const client = context.switchToWs().getClient()
    const qr = this.dataSource.createQueryRunner()

    await qr.connect()
    await qr.startTransaction()

    client.data.qr = qr

    return next.handle().pipe(
      tap(async () => {
        await qr.commitTransaction()
        await qr.release()
      }),
      catchError(async (e) => {
        try {
          await qr.rollbackTransaction()
          await qr.release()
        } catch (rollbackError) {
          console.error('Rollback/Release Error:', rollbackError)
        }
        throw new InternalServerErrorException(
          `Transaction failed: ${e.message}`,
        )
      }),
    )
  }
}
