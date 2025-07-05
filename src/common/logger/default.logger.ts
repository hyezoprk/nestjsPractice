import { ConsoleLogger, Injectable } from '@nestjs/common'

@Injectable()
export class DefaultLogger extends ConsoleLogger {
  warn(message: unknown, _context?: unknown, ...rest: unknown[]): void {
    console.log('---- WARN LOG ----')
    super.warn(message, ...rest)
  }
  error(message: unknown, _context?: unknown, ...rest: unknown[]): void {
    console.log('---- ERROR LOG ----')
    super.error(message, ...rest)
  }
}
