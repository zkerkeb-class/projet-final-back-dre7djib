import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { LoggerService } from "../../shared/services/LoggerService";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: { method: string; url: string } = context
      .switchToHttp()
      .getRequest();
    const { method, url } = request;

    this.loggerService.info("Incoming request", { method, url });

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        this.loggerService.info("Request completed", {
          method,
          url,
          responseTime,
        });
      }),
    );
  }
}
