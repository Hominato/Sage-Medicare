import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const { user, method, url, body, ip } = req;

    // Parse what was modified per HIPAA/NDPA
    const details =
      body && Object.keys(body).length > 0 ? JSON.stringify(body) : undefined;

    return next.handle().pipe(
      tap(() => {
        if (user && user.userId) {
          this.auditService
            .logAction(user.userId, method, url, details, ip)
            .catch((err) => {
              console.error('Failed to log HIPAA audit event', err);
            });
        }
      }),
    );
  }
}
