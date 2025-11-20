import { Injectable, NestMiddleware, UnauthorizedException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const validToken = this.configService.get<string>('AUTH_TOKEN');

    if (!validToken) {
      this.logger.error('[Auth-Middleware]: AUTH_TOKEN not configured in environment variables');
      throw new UnauthorizedException('Authentication service unavailable');
    }

    this.logger.log(`[Auth-Middleware]: Validating authentication for ${req.method} ${req.path}`);

    if (!authHeader) {
      this.logger.warn('[Auth-Middleware]: No authorization header provided');
      throw new UnauthorizedException('Authorization header is required');
    }

    // Expected format: "Bearer <token>"
    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer') {
      this.logger.warn('[Auth-Middleware]: Invalid authorization format. Expected "Bearer <token>"');
      throw new UnauthorizedException('Invalid authorization format. Use "Bearer <token>"');
    }

    if (!token) {
      this.logger.warn('[Auth-Middleware]: Token not provided');
      throw new UnauthorizedException('Token is required');
    }

    if (token !== validToken) {
      this.logger.warn(`[Auth-Middleware]: Invalid token provided: ${token.substring(0, 5)}...`);
      throw new UnauthorizedException('Invalid authentication token');
    }

    this.logger.log('[Auth-Middleware]: Authentication successful');
    next();
  }
}

