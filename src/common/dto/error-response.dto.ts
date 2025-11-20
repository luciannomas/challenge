import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard error response structure for all API errors
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message or array of error messages',
    example: 'Validation failed',
    oneOf: [
      { type: 'string' },
      { type: 'array', items: { type: 'string' } },
    ],
  })
  message: string | string[];

  @ApiProperty({
    description: 'Error type/name',
    example: 'Bad Request',
  })
  error: string;
}

/**
 * Example error responses for Swagger documentation
 */
export const ErrorExamples = {
  BadRequest: {
    description: 'Bad Request - Validation error',
    content: {
      'application/json': {
        examples: {
          validation: {
            summary: 'Validation Error',
            value: {
              statusCode: 400,
              message: [
                'CUIT must be 11 digits',
                'Business name must be at least 3 characters long',
              ],
              error: 'Bad Request',
            },
          },
          invalidFormat: {
            summary: 'Invalid Format',
            value: {
              statusCode: 400,
              message: 'Adhesion date must be in format YYYY-MM-DD (e.g., 2025-11-13)',
              error: 'Bad Request',
            },
          },
        },
      },
    },
  },

  Unauthorized: {
    description: 'Unauthorized - Missing or invalid authentication',
    content: {
      'application/json': {
        examples: {
          missingToken: {
            summary: 'Missing Token',
            value: {
              statusCode: 401,
              message: 'Authorization header is required',
              error: 'Unauthorized',
            },
          },
          invalidToken: {
            summary: 'Invalid Token',
            value: {
              statusCode: 401,
              message: 'Invalid authentication token',
              error: 'Unauthorized',
            },
          },
          invalidFormat: {
            summary: 'Invalid Format',
            value: {
              statusCode: 401,
              message: 'Invalid authorization format. Use "Bearer <token>"',
              error: 'Unauthorized',
            },
          },
        },
      },
    },
  },

  NotFound: {
    description: 'Not Found - Resource not found',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Company not found',
          error: 'Not Found',
        },
      },
    },
  },

  Conflict: {
    description: 'Conflict - Resource already exists',
    content: {
      'application/json': {
        examples: {
          duplicateCuit: {
            summary: 'Duplicate CUIT',
            value: {
              statusCode: 409,
              message: 'Company with CUIT 20123456789 already exists',
              error: 'Conflict',
            },
          },
        },
      },
    },
  },

  TooManyRequests: {
    description: 'Too Many Requests - Rate limit exceeded',
    content: {
      'application/json': {
        example: {
          statusCode: 429,
          message: 'Too many requests. You have been blocked for 40 seconds.',
          error: 'Too Many Requests',
        },
      },
    },
  },

  InternalServerError: {
    description: 'Internal Server Error',
    content: {
      'application/json': {
        examples: {
          databaseError: {
            summary: 'Database Error',
            value: {
              statusCode: 500,
              message: 'An error occurred while processing your request',
              error: 'Internal Server Error',
            },
          },
          unexpectedError: {
            summary: 'Unexpected Error',
            value: {
              statusCode: 500,
              message: 'Internal server error',
              error: 'Internal Server Error',
            },
          },
        },
      },
    },
  },
};

