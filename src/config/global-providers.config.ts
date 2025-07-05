import { ModuleMetadata } from '@nestjs/common'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { AuthGuard } from 'src/auth/guard/auth.guard'
import { RBACGuard } from 'src/auth/guard/rbac.guard'
import { QueryFailedExceptionFilter } from 'src/common/filter/query-failed.filter'
import { ResponseTimeInterceptor } from 'src/common/interceptor/response-time.interceptor'
import { ThrottleInterceptor } from 'src/common/interceptor/throttle.interceptor'

export const providers: ModuleMetadata['providers'] = [
  {
    provide: APP_GUARD,
    useClass: AuthGuard,
  },
  {
    provide: APP_GUARD,
    useClass: RBACGuard,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: ResponseTimeInterceptor,
  },
  {
    provide: APP_FILTER,
    useClass: QueryFailedExceptionFilter,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: ThrottleInterceptor,
  },
]
