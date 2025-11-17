import { Injectable, NestMiddleware, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RequestTracker {
  requests: number[];
  blockedUntil?: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RateLimitMiddleware.name);
  private readonly tracker = new Map<string, RequestTracker>();
  
  // Configuration
  private readonly MAX_REQUESTS = 5;
  private readonly TIME_WINDOW = 30000; // 30 seconds in milliseconds
  private readonly BLOCK_DURATION = 10000; // 10 seconds in milliseconds

  use(req: Request, res: Response, next: NextFunction) {
    const clientIp = this.getClientIp(req);
    const now = Date.now();

    this.logger.log(`[Rate-Limit]: Request from ${clientIp} to ${req.method} ${req.path}`);

    // Get or create tracker for this IP
    let tracker = this.tracker.get(clientIp);
    if (!tracker) {
      tracker = { requests: [] };
      this.tracker.set(clientIp, tracker);
    }

    // Check if client is currently blocked
    if (tracker.blockedUntil && now < tracker.blockedUntil) {
      const remainingSeconds = Math.ceil((tracker.blockedUntil - now) / 1000);
      this.logger.warn(`[Rate-Limit]: Client ${clientIp} is blocked. ${remainingSeconds}s remaining`);
      
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Acceso denegado. Volver a intentar en ${remainingSeconds} segundos`,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Remove blocked status if time has passed
    if (tracker.blockedUntil && now >= tracker.blockedUntil) {
      delete tracker.blockedUntil;
      tracker.requests = [];
      this.logger.log(`[Rate-Limit]: Client ${clientIp} unblocked`);
    }

    // Remove requests outside the time window
    tracker.requests = tracker.requests.filter(timestamp => now - timestamp < this.TIME_WINDOW);

    // Check if limit exceeded
    if (tracker.requests.length >= this.MAX_REQUESTS) {
      tracker.blockedUntil = now + this.BLOCK_DURATION;
      this.logger.warn(`[Rate-Limit]: Client ${clientIp} exceeded limit (${this.MAX_REQUESTS} requests in ${this.TIME_WINDOW / 1000}s). Blocked for ${this.BLOCK_DURATION / 1000}s`);
      
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Acceso denegado. Volver a intentar en ${this.BLOCK_DURATION / 1000} segundos`,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Add current request
    tracker.requests.push(now);
    this.logger.log(`[Rate-Limit]: Client ${clientIp} - Request ${tracker.requests.length}/${this.MAX_REQUESTS} in window`);

    // Clean up old entries periodically (every 60 seconds)
    this.cleanupOldEntries();

    next();
  }

  private getClientIp(req: Request): string {
    // Try to get real IP from headers (useful when behind proxy/load balancer)
    const forwarded = req.headers['x-forwarded-for'] as string;
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  private cleanupOldEntries() {
    const now = Date.now();
    const entriesToDelete: string[] = [];

    this.tracker.forEach((tracker, ip) => {
      // Remove if no recent requests and not blocked
      if (
        tracker.requests.length === 0 &&
        (!tracker.blockedUntil || now > tracker.blockedUntil + 60000)
      ) {
        entriesToDelete.push(ip);
      }
    });

    entriesToDelete.forEach(ip => {
      this.tracker.delete(ip);
    });

    if (entriesToDelete.length > 0) {
      this.logger.log(`[Rate-Limit]: Cleaned up ${entriesToDelete.length} old entries`);
    }
  }
}

