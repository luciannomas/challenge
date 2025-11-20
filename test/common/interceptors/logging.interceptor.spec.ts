import { LoggingInterceptor } from '../../../src/common/interceptors/logging.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { Request, Response } from 'express';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockExecutionContext: Partial<ExecutionContext>;
  let mockCallHandler: Partial<CallHandler>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();

    // Mock response
    mockResponse = {
      setHeader: jest.fn(),
      statusCode: 200,
    };

    // Mock request
    mockRequest = {
      method: 'GET',
      path: '/test',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-agent'),
    };

    // Mock execution context
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    };

    // Mock call handler
    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ data: 'test' })),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should generate unique requestId and attach it to request', (done) => {
      const result$ = interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      result$.subscribe({
        next: () => {
          expect((mockRequest as any).requestId).toBeDefined();
          expect(typeof (mockRequest as any).requestId).toBe('string');
          expect((mockRequest as any).requestId.length).toBeGreaterThan(0);
          done();
        },
      });
    });

    it('should attach startTime to request', (done) => {
      const result$ = interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      result$.subscribe({
        next: () => {
          expect((mockRequest as any).startTime).toBeDefined();
          expect(typeof (mockRequest as any).startTime).toBe('number');
          done();
        },
      });
    });

    it('should add X-Request-Id header to response', (done) => {
      const result$ = interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      result$.subscribe({
        next: () => {
          expect(mockResponse.setHeader).toHaveBeenCalledWith(
            'X-Request-Id',
            expect.any(String),
          );
          done();
        },
      });
    });

    it('should log incoming request', (done) => {
      const logSpy = jest.spyOn((interceptor as any).logger, 'log');

      const result$ = interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      result$.subscribe({
        next: () => {
          expect(logSpy).toHaveBeenCalled();
          const firstCall = logSpy.mock.calls[0][0];
          expect(firstCall).toContain('-->');
          expect(firstCall).toContain('GET');
          expect(firstCall).toContain('/test');
          expect(firstCall).toContain('127.0.0.1');
          done();
        },
      });
    });

    it('should log successful response with duration and status', (done) => {
      const logSpy = jest.spyOn((interceptor as any).logger, 'log');

      const result$ = interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      result$.subscribe({
        next: () => {
          expect(logSpy).toHaveBeenCalledTimes(2); // Incoming + outgoing
          const secondCall = logSpy.mock.calls[1];
          expect(secondCall[0]).toContain('<--');
          expect(secondCall[0]).toContain('GET');
          expect(secondCall[0]).toContain('/test');
          expect(secondCall[0]).toContain('200');
          expect(secondCall[0]).toContain('ms');
          done();
        },
      });
    });

    it('should include structured log data in success response', (done) => {
      const logSpy = jest.spyOn((interceptor as any).logger, 'log');

      const result$ = interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      result$.subscribe({
        next: () => {
          const secondCall = logSpy.mock.calls[1];
          const logData = JSON.parse(secondCall[1] as string);
          
          expect(logData).toHaveProperty('requestId');
          expect(logData).toHaveProperty('route', '/test');
          expect(logData).toHaveProperty('method', 'GET');
          expect(logData).toHaveProperty('duration');
          expect(logData.duration).toMatch(/\d+ms/);
          expect(logData).toHaveProperty('status', 200);
          expect(logData).toHaveProperty('ip', '127.0.0.1');
          expect(logData).toHaveProperty('userAgent');
          done();
        },
      });
    });

    it('should handle unknown user-agent', (done) => {
      (mockRequest.get as jest.Mock).mockReturnValue(undefined);

      const result$ = interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      result$.subscribe({
        next: () => {
          expect(mockRequest.get).toHaveBeenCalledWith('user-agent');
          done();
        },
      });
    });

    it('should log error when request fails', (done) => {
      const testError = new Error('Test error');
      mockCallHandler.handle = jest.fn().mockReturnValue(throwError(() => testError));
      
      const errorSpy = jest.spyOn((interceptor as any).logger, 'error');

      const result$ = interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      result$.subscribe({
        error: () => {
          expect(errorSpy).toHaveBeenCalled();
          const errorCall = errorSpy.mock.calls[0][0];
          expect(errorCall).toContain('<--');
          expect(errorCall).toContain('ERROR');
          expect(errorCall).toContain('ms');
          done();
        },
      });
    });

    it('should calculate duration correctly', (done) => {
      const logSpy = jest.spyOn((interceptor as any).logger, 'log');

      const result$ = interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      result$.subscribe({
        next: () => {
          const startTime = (mockRequest as any).startTime;
          expect(Date.now() - startTime).toBeGreaterThanOrEqual(0);
          done();
        },
      });
    });

    it('should handle different HTTP methods', (done) => {
      // Create new request with different method and path
      const customRequest: Partial<Request> = {
        method: 'POST',
        path: '/api/test',
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-agent'),
      };

      const customContext: Partial<ExecutionContext> = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: () => customRequest,
          getResponse: () => mockResponse,
        }),
      };

      const logSpy = jest.spyOn((interceptor as any).logger, 'log');

      const result$ = interceptor.intercept(
        customContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      result$.subscribe({
        next: () => {
          const firstCall = logSpy.mock.calls[0][0];
          expect(firstCall).toContain('POST');
          expect(firstCall).toContain('/api/test');
          done();
        },
      });
    });

    it('should handle different status codes', (done) => {
      mockResponse.statusCode = 201;
      const logSpy = jest.spyOn((interceptor as any).logger, 'log');

      const result$ = interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      result$.subscribe({
        next: () => {
          const secondCall = logSpy.mock.calls[1];
          expect(secondCall[0]).toContain('201');
          done();
        },
      });
    });
  });
});

