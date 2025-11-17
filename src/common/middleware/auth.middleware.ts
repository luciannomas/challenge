import { Injectable, NestMiddleware, UnauthorizedException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);
  private readonly VALID_TOKEN = 'asdasdsafd'; // Mock token for authentication

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    this.logger.log(`[Auth-Middleware]: Validating authentication for ${req.method} ${req.path}`);

    if (!authHeader) {
      this.logger.warn('[Auth-Middleware]: No authorization header provided');
      throw new UnauthorizedException('Authorization header is required');
    }

    // Expected format: "Bearer asdasdsafd"
    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer') {
      this.logger.warn('[Auth-Middleware]: Invalid authorization format. Expected "Bearer <token>"');
      throw new UnauthorizedException('Invalid authorization format. Use "Bearer <token>"');
    }

    if (!token) {
      this.logger.warn('[Auth-Middleware]: Token not provided');
      throw new UnauthorizedException('Token is required');
    }

    if (token !== this.VALID_TOKEN) {
      this.logger.warn(`[Auth-Middleware]: Invalid token provided: ${token.substring(0, 5)}...`);
      throw new UnauthorizedException('Invalid authentication token');
    }

    this.logger.log('[Auth-Middleware]: Authentication successful');
    next();
  }
}

