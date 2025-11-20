import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Logging Interceptor with structured logs
 * 
 * Generates requestId for tracing and logs all requests with:
 * - requestId: Unique identifier for request tracing
 * - route: API endpoint path
 * - method: HTTP method (GET, POST, etc.)
 * - duration: Request processing time in ms
 * - status: HTTP status code
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Generate unique requestId
    const requestId = uuidv4();
    const startTime = Date.now();

    // Attach requestId and startTime to request for ExceptionFilter access
    (request as any).requestId = requestId;
    (request as any).startTime = startTime;

    // Add requestId to response headers for client tracing
    response.setHeader('X-Request-Id', requestId);

    const { method, path, ip } = request;
    const userAgent = request.get('user-agent') || 'unknown';

    // Log incoming request
    this.logger.log(
      `[${requestId}] --> ${method} ${path} - ${ip}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          // Calculate duration
          const duration = Date.now() - startTime;
          const { statusCode } = response;

          // Structured log data
          const logData = {
            requestId,
            route: path,
            method,
            duration: `${duration}ms`,
            status: statusCode,
            ip,
            userAgent,
          };

          // Log successful response
          this.logger.log(
            `[${requestId}] <-- ${method} ${path} - ${statusCode} - ${duration}ms`,
            JSON.stringify(logData),
          );
        },
        error: (error) => {
          // Error logging is handled by HttpExceptionFilter
          // Just log a brief message here
          const duration = Date.now() - startTime;
          this.logger.error(
            `[${requestId}] <-- ${method} ${path} - ERROR - ${duration}ms`,
          );
        },
      }),
    );
  }
}

