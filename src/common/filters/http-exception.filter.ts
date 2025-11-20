import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global Exception Filter with structured logging
 * 
 * Captures all exceptions and logs them with:
 * - requestId: Unique identifier for request tracing
 * - route: API endpoint path
 * - method: HTTP method (GET, POST, etc.)
 * - duration: Request processing time in ms
 * - status: HTTP status code
 * - error: Error details
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Extract requestId from request (set by LoggingInterceptor)
    const requestId = (request as any).requestId || 'unknown';
    
    // Extract startTime from request (set by LoggingInterceptor)
    const startTime = (request as any).startTime || Date.now();
    const duration = Date.now() - startTime;

    // Determine HTTP status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Extract error message
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    // Build error response
    const errorResponse = {
      statusCode: status,
      message: typeof message === 'string' ? message : (message as any).message,
      error: this.getErrorName(status),
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
    };

    // Structured log with all required fields
    const logData = {
      requestId,
      route: request.path,
      method: request.method,
      duration: `${duration}ms`,
      status,
      error: exception instanceof Error ? exception.message : 'Unknown error',
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    // Log error with structured data
    if (status >= 500) {
      this.logger.error(
        `[${requestId}] ${request.method} ${request.path} - ${status} - ${duration}ms`,
        logData,
      );
    } else {
      this.logger.warn(
        `[${requestId}] ${request.method} ${request.path} - ${status} - ${duration}ms`,
        logData,
      );
    }

    // Send response
    response.status(status).json(errorResponse);
  }

  /**
   * Get error name from HTTP status code
   */
  private getErrorName(status: number): string {
    const errorNames: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
    };

    return errorNames[status] || 'Error';
  }
}

