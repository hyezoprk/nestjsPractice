import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common'
import { catchError, finalize, Observable, tap } from 'rxjs'
import { DataSource } from 'typeorm'

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest()
    const qr = this.dataSource.createQueryRunner()

    await qr.connect()
    await qr.startTransaction()

    req.qr = qr

    return next.handle().pipe(
      tap(async () => {
        await qr.commitTransaction()
      }),
      catchError(async (e) => {
        try {
          await qr.rollbackTransaction()
        } catch (rollbackError) {
          console.error('Rollback Error:', rollbackError)
        }
        throw new InternalServerErrorException(
          `Transaction failed: ${e.message}`,
        )
      }),
      finalize(async () => {
        await qr.release()
      }),
    )
  }
}
