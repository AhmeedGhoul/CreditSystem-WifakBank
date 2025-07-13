import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { ActivityLogService } from '../activity_log/activity_log.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly activityLogService: ActivityLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const handlerName = context.getHandler().name;
    const controllerName = context.getClass().name;
    const descriptionPrefix = `${controllerName}.${handlerName}`;
    const now = Date.now();

    console.log(`➡️ Executing: ${descriptionPrefix}()`);

    const user = req.user;

    return next.handle().pipe(
      tap(async (responseData) => {
        const logData = {
          activityLogName: handlerName,
          activityLogDescription: `${descriptionPrefix} succeeded`,
          ipAddress: '127.0.0.1',
          country: 'Tunisia',
        };

        let userId: number | undefined = undefined;

        if (user?.userId) {
          userId = user.userId;
          console.log("hey")
        }
        else if (handlerName.toLowerCase().includes('signin') || handlerName.toLowerCase().includes('signup')) {

          if (responseData?.userId) userId = responseData.userId;
          else if (responseData?.id) userId = responseData.id;
        }
        else  console.log("heya");

        await this.activityLogService.create(logData, userId);
      }),

      catchError((error) => {

        const logData = {
          activityLogName: handlerName,
          activityLogDescription: `${descriptionPrefix} failed: ${error.message}`,
          ipAddress: '127.0.0.1',
          country: 'Tunisia',
        };

        const userId = user?.userId;

        this.activityLogService.create(logData, userId).catch(() => null);

        return throwError(() => error);
      }),
    );
  }
}
