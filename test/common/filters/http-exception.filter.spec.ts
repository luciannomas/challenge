import { HttpExceptionFilter } from '../../../src/common/filters/http-exception.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockArgumentsHost: Partial<ArgumentsHost>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    filter = new HttpExceptionFilter();

    // Mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock request
    mockRequest = {
      url: '/test',
      path: '/test',
      method: 'GET',
    };

    // Mock arguments host
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should handle HttpException with correct status and message', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      (mockRequest as any).requestId = 'test-request-id';
      (mockRequest as any).startTime = Date.now();

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Test error',
          error: 'Bad Request',
          requestId: 'test-request-id',
          path: '/test',
        }),
      );
    });

    it('should handle non-HttpException as internal server error', () => {
      const exception = new Error('Unexpected error');
      (mockRequest as any).requestId = 'test-request-id';
      (mockRequest as any).startTime = Date.now();

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          error: 'Internal Server Error',
        }),
      );
    });

    it('should use "unknown" requestId when not present', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      // No requestId set
      (mockRequest as any).startTime = Date.now();

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'unknown',
        }),
      );
    });

    it('should calculate duration from startTime', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      const startTime = Date.now() - 100; // 100ms ago
      (mockRequest as any).requestId = 'test-request-id';
      (mockRequest as any).startTime = startTime;

      const warnSpy = jest.spyOn((filter as any).logger, 'warn');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(warnSpy).toHaveBeenCalled();
      const logData = warnSpy.mock.calls[0][1] as any;
      expect(logData.duration).toMatch(/\d+ms/);
    });

    it('should use current time when startTime is not present', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      (mockRequest as any).requestId = 'test-request-id';
      // No startTime set

      const warnSpy = jest.spyOn((filter as any).logger, 'warn');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(warnSpy).toHaveBeenCalled();
      const logData = warnSpy.mock.calls[0][1] as any;
      expect(logData.duration).toMatch(/\d+ms/);
    });

    it('should log 5xx errors with error level', () => {
      const exception = new HttpException(
        'Internal error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      (mockRequest as any).requestId = 'test-request-id';
      (mockRequest as any).startTime = Date.now();

      const errorSpy = jest.spyOn((filter as any).logger, 'error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(errorSpy).toHaveBeenCalled();
      const logMessage = errorSpy.mock.calls[0][0];
      expect(logMessage).toContain('[test-request-id]');
      expect(logMessage).toContain('GET');
      expect(logMessage).toContain('/test');
      expect(logMessage).toContain('500');
      expect(logMessage).toContain('ms');
    });

    it('should log 4xx errors with warn level', () => {
      const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);
      (mockRequest as any).requestId = 'test-request-id';
      (mockRequest as any).startTime = Date.now();

      const warnSpy = jest.spyOn((filter as any).logger, 'warn');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(warnSpy).toHaveBeenCalled();
      const logMessage = warnSpy.mock.calls[0][0];
      expect(logMessage).toContain('[test-request-id]');
      expect(logMessage).toContain('GET');
      expect(logMessage).toContain('/test');
      expect(logMessage).toContain('404');
    });

    it('should include structured log data with all required fields', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      (mockRequest as any).requestId = 'test-request-id';
      (mockRequest as any).startTime = Date.now();

      const warnSpy = jest.spyOn((filter as any).logger, 'warn');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      const logData = warnSpy.mock.calls[0][1] as any;
      expect(logData).toHaveProperty('requestId', 'test-request-id');
      expect(logData).toHaveProperty('route', '/test');
      expect(logData).toHaveProperty('method', 'GET');
      expect(logData).toHaveProperty('duration');
      expect(logData).toHaveProperty('status', HttpStatus.BAD_REQUEST);
      expect(logData).toHaveProperty('error', 'Test error');
      expect(logData).toHaveProperty('stack');
    });

    it('should include timestamp in error response', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      (mockRequest as any).requestId = 'test-request-id';
      (mockRequest as any).startTime = Date.now();

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
        }),
      );
    });

    it('should handle HttpException with object response', () => {
      const exceptionResponse = {
        message: ['Field error 1', 'Field error 2'],
        error: 'Validation Error',
      };
      const exception = new HttpException(exceptionResponse, HttpStatus.BAD_REQUEST);
      (mockRequest as any).requestId = 'test-request-id';
      (mockRequest as any).startTime = Date.now();

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: exceptionResponse.message,
        }),
      );
    });

    it('should handle unknown exception type', () => {
      const exception = 'string error'; // Not an Error object
      (mockRequest as any).requestId = 'test-request-id';
      (mockRequest as any).startTime = Date.now();

      const errorSpy = jest.spyOn((filter as any).logger, 'error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      const logData = errorSpy.mock.calls[0][1] as any;
      expect(logData.error).toBe('Unknown error');
      expect(logData.stack).toBeUndefined();
    });
  });

  describe('getErrorName', () => {
    it('should return correct error name for 400', () => {
      const errorName = (filter as any).getErrorName(400);
      expect(errorName).toBe('Bad Request');
    });

    it('should return correct error name for 401', () => {
      const errorName = (filter as any).getErrorName(401);
      expect(errorName).toBe('Unauthorized');
    });

    it('should return correct error name for 403', () => {
      const errorName = (filter as any).getErrorName(403);
      expect(errorName).toBe('Forbidden');
    });

    it('should return correct error name for 404', () => {
      const errorName = (filter as any).getErrorName(404);
      expect(errorName).toBe('Not Found');
    });

    it('should return correct error name for 409', () => {
      const errorName = (filter as any).getErrorName(409);
      expect(errorName).toBe('Conflict');
    });

    it('should return correct error name for 422', () => {
      const errorName = (filter as any).getErrorName(422);
      expect(errorName).toBe('Unprocessable Entity');
    });

    it('should return correct error name for 429', () => {
      const errorName = (filter as any).getErrorName(429);
      expect(errorName).toBe('Too Many Requests');
    });

    it('should return correct error name for 500', () => {
      const errorName = (filter as any).getErrorName(500);
      expect(errorName).toBe('Internal Server Error');
    });

    it('should return correct error name for 502', () => {
      const errorName = (filter as any).getErrorName(502);
      expect(errorName).toBe('Bad Gateway');
    });

    it('should return correct error name for 503', () => {
      const errorName = (filter as any).getErrorName(503);
      expect(errorName).toBe('Service Unavailable');
    });

    it('should return correct error name for 504', () => {
      const errorName = (filter as any).getErrorName(504);
      expect(errorName).toBe('Gateway Timeout');
    });

    it('should return "Error" for unknown status code', () => {
      const errorName = (filter as any).getErrorName(999);
      expect(errorName).toBe('Error');
    });
  });
});

