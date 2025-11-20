import { AuthMiddleware } from '../../../src/common/middleware/auth.middleware';
import { UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

describe('AuthMiddleware', () => {
  let middleware: AuthMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockConfigService: Partial<ConfigService>;

  const VALID_TOKEN = 'Bearer_mK7pL9xR4tN2wQ8vZ3jH6yF5sA1cE0bD';

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'AUTH_TOKEN') return VALID_TOKEN;
        return undefined;
      }),
    };
    middleware = new AuthMiddleware(mockConfigService as ConfigService);
    mockRequest = {
      headers: {},
      method: 'POST',
      path: '/companies/adhesion',
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  describe('Valid Authentication', () => {
    it('should call next() with valid Bearer token', () => {
      mockRequest.headers = {
        authorization: `Bearer ${VALID_TOKEN}`,
      };

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should not throw exception with valid token', () => {
      mockRequest.headers = {
        authorization: `Bearer ${VALID_TOKEN}`,
      };

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).not.toThrow();
    });

    it('should handle Bearer with correct token', () => {
      mockRequest.headers = {
        authorization: `Bearer ${VALID_TOKEN}`,
      };

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('Missing Authorization Header', () => {
    it('should throw UnauthorizedException when no authorization header', () => {
      mockRequest.headers = {};

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(UnauthorizedException);
    });

    it('should throw with correct message when no authorization header', () => {
      mockRequest.headers = {};

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow('Authorization header is required');
    });

    it('should not call next() when no authorization header', () => {
      mockRequest.headers = {};

      try {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      } catch (error) {
        // Expected to throw
      }

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Invalid Authorization Format', () => {
    it('should throw when format is not "Bearer <token>"', () => {
      mockRequest.headers = {
        authorization: `Basic ${VALID_TOKEN}`,
      };

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(UnauthorizedException);
    });

    it('should throw when bearer keyword is missing', () => {
      mockRequest.headers = {
        authorization: VALID_TOKEN,
      };

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow('Invalid authorization format');
    });

    it('should throw when format has wrong structure', () => {
      mockRequest.headers = {
        authorization: `Token ${VALID_TOKEN}`,
      };

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(UnauthorizedException);
    });

    it('should not call next() with invalid format', () => {
      mockRequest.headers = {
        authorization: `Basic ${VALID_TOKEN}`,
      };

      try {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      } catch (error) {
        // Expected to throw
      }

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Missing Token', () => {
    it('should throw when token is not provided', () => {
      mockRequest.headers = {
        authorization: 'Bearer ',
      };

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(UnauthorizedException);
    });

    it('should throw with correct message when token is missing', () => {
      mockRequest.headers = {
        authorization: 'Bearer',
      };

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow('Token is required');
    });

    it('should not call next() when token is missing', () => {
      mockRequest.headers = {
        authorization: 'Bearer ',
      };

      try {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      } catch (error) {
        // Expected to throw
      }

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Invalid Token', () => {
    it('should throw when token is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer wrongtoken',
      };

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(UnauthorizedException);
    });

    it('should throw with correct message for invalid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer wrongtoken',
      };

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow('Invalid authentication token');
    });

    it('should not call next() with invalid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer wrongtoken',
      };

      try {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      } catch (error) {
        // Expected to throw
      }

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject similar but incorrect tokens', () => {
      const invalidTokens = [
        'Bearer_mK7pL9xR4tN2wQ8vZ3jH6yF5sA1cE0b',     // Missing last character
        'Bearer_mK7pL9xR4tN2wQ8vZ3jH6yF5sA1cE0bDD',   // Extra characters
        'BEARER_MK7PL9XR4TN2WQ8VZ3JH6YF5SA1CE0BD',    // Wrong case
      ];

      invalidTokens.forEach(token => {
        mockRequest.headers = {
          authorization: `Bearer ${token}`,
        };

        expect(() => {
          middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
        }).toThrow(UnauthorizedException);
      });
    });
  });

  describe('Case Sensitivity', () => {
    it('should be case-sensitive for Bearer keyword', () => {
      mockRequest.headers = {
        authorization: `bearer ${VALID_TOKEN}`,
      };

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(UnauthorizedException);
    });

    it('should be case-sensitive for token', () => {
      mockRequest.headers = {
        authorization: 'Bearer BEARER_MK7PL9XR4TN2WQ8VZ3JH6YF5SA1CE0BD',
      };

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(UnauthorizedException);
    });
  });

  describe('Whitespace Handling', () => {
    it('should handle single space between Bearer and token', () => {
      mockRequest.headers = {
        authorization: `Bearer ${VALID_TOKEN}`,
      };

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle trailing whitespace (split removes it)', () => {
      mockRequest.headers = {
        authorization: `Bearer ${VALID_TOKEN} `,
      };

      // The split(' ') method separates into ["Bearer", "VALID_TOKEN", ""]
      // So the token is correctly extracted
      mockNext = jest.fn();
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should not accept multiple spaces between Bearer and token', () => {
      mockRequest.headers = {
        authorization: `Bearer  ${VALID_TOKEN}`,
      };

      // Split gives ["Bearer", "", "VALID_TOKEN"], token becomes "" (empty)
      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(UnauthorizedException);
    });

    it('should not accept leading whitespace before Bearer', () => {
      mockRequest.headers = {
        authorization: ` Bearer ${VALID_TOKEN}`,
      };

      // Split gives ["", "Bearer", "VALID_TOKEN"], bearer becomes "" (not "Bearer")
      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(UnauthorizedException);
    });
  });

  describe('Request Context', () => {
    it('should work with different HTTP methods', () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

      methods.forEach(method => {
        const testRequest: Partial<Request> = {
          headers: {
            authorization: `Bearer ${VALID_TOKEN}`,
          },
          method: method,
          path: '/companies/adhesion',
        };
        mockNext = jest.fn();

        middleware.use(testRequest as Request, mockResponse as Response, mockNext);
        expect(mockNext).toHaveBeenCalled();
      });
    });

    it('should work with different paths', () => {
      const paths = [
        '/companies/adhesion',
        '/api/companies',
        '/transfers',
      ];

      paths.forEach(path => {
        const testRequest: Partial<Request> = {
          headers: {
            authorization: `Bearer ${VALID_TOKEN}`,
          },
          method: 'POST',
          path: path,
        };
        mockNext = jest.fn();

        middleware.use(testRequest as Request, mockResponse as Response, mockNext);
        expect(mockNext).toHaveBeenCalled();
      });
    });
  });

  describe('Middleware Instance', () => {
    it('should be an instance of AuthMiddleware', () => {
      expect(middleware).toBeInstanceOf(AuthMiddleware);
    });

    it('should have use method', () => {
      expect(middleware.use).toBeDefined();
      expect(typeof middleware.use).toBe('function');
    });

    it('should be reusable across multiple requests', () => {
      mockRequest.headers = {
        authorization: `Bearer ${VALID_TOKEN}`,
      };

      // First request
      const next1 = jest.fn();
      middleware.use(mockRequest as Request, mockResponse as Response, next1);
      expect(next1).toHaveBeenCalled();

      // Second request
      const next2 = jest.fn();
      middleware.use(mockRequest as Request, mockResponse as Response, next2);
      expect(next2).toHaveBeenCalled();
    });
  });

  describe('ConfigService Integration', () => {
    it('should throw error when AUTH_TOKEN is not configured', () => {
      const emptyConfigService = {
        get: jest.fn(() => undefined),
      };
      const middlewareWithoutToken = new AuthMiddleware(emptyConfigService as any);
      
      mockRequest.headers = {
        authorization: `Bearer ${VALID_TOKEN}`,
      };

      expect(() => {
        middlewareWithoutToken.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow('Authentication service unavailable');
    });

    it('should use token from ConfigService', () => {
      mockRequest.headers = {
        authorization: `Bearer ${VALID_TOKEN}`,
      };

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockConfigService.get).toHaveBeenCalledWith('AUTH_TOKEN');
      expect(mockNext).toHaveBeenCalled();
    });
  });
});

