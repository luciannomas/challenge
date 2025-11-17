import { TimezoneInterceptor } from '../../../src/common/interceptors/timezone.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import * as moment from 'moment-timezone';
import { TIMEZONE } from '../../../src/common/constants/timezone.constant';

describe('TimezoneInterceptor', () => {
  let interceptor: TimezoneInterceptor;
  let mockExecutionContext: Partial<ExecutionContext>;
  let mockCallHandler: Partial<CallHandler>;

  beforeEach(() => {
    interceptor = new TimezoneInterceptor();
    mockExecutionContext = {};
    mockCallHandler = {
      handle: jest.fn(),
    };

    // Set timezone for tests
    moment.tz.setDefault(TIMEZONE.NAME);
  });

  describe('Interceptor Instance', () => {
    it('should be defined', () => {
      expect(interceptor).toBeDefined();
    });

    it('should be an instance of TimezoneInterceptor', () => {
      expect(interceptor).toBeInstanceOf(TimezoneInterceptor);
    });

    it('should have intercept method', () => {
      expect(interceptor.intercept).toBeDefined();
      expect(typeof interceptor.intercept).toBe('function');
    });
  });

  describe('Transform Dates', () => {
    it('should transform Date objects to timezone format', (done) => {
      const testDate = new Date('2025-11-14T10:30:00.000Z');
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testDate));

      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe((result) => {
          expect(typeof result).toBe('string');
          expect(result).toContain('2025-11-14');
          done();
        });
    });

    it('should transform dates in objects', (done) => {
      const testData = {
        id: '123',
        name: 'Test',
        createdAt: new Date('2025-11-14T10:30:00.000Z'),
      };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe((result) => {
          expect(result.id).toBe('123');
          expect(result.name).toBe('Test');
          expect(typeof result.createdAt).toBe('string');
          expect(result.createdAt).toContain('2025-11-14');
          done();
        });
    });

    it('should transform dates in nested objects', (done) => {
      const testData = {
        company: {
          id: '123',
          createdAt: new Date('2025-11-14T10:30:00.000Z'),
        },
      };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe((result) => {
          expect(result.company.id).toBe('123');
          expect(typeof result.company.createdAt).toBe('string');
          done();
        });
    });

    it('should transform dates in arrays', (done) => {
      const testData = [
        { id: '1', date: new Date('2025-11-14T10:30:00.000Z') },
        { id: '2', date: new Date('2025-11-15T10:30:00.000Z') },
      ];
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe((result) => {
          expect(Array.isArray(result)).toBe(true);
          expect(result).toHaveLength(2);
          expect(typeof result[0].date).toBe('string');
          expect(typeof result[1].date).toBe('string');
          done();
        });
    });

    it('should transform multiple dates in same object', (done) => {
      const testData = {
        createdAt: new Date('2025-11-14T10:00:00.000Z'),
        updatedAt: new Date('2025-11-14T12:00:00.000Z'),
        deletedAt: new Date('2025-11-14T14:00:00.000Z'),
      };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe((result) => {
          expect(typeof result.createdAt).toBe('string');
          expect(typeof result.updatedAt).toBe('string');
          expect(typeof result.deletedAt).toBe('string');
          done();
        });
    });
  });

  describe('Non-Date Values', () => {
    it('should not transform strings', (done) => {
      const testData = { name: 'Test String' };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe((result) => {
          expect(result.name).toBe('Test String');
          expect(typeof result.name).toBe('string');
          done();
        });
    });

    it('should not transform numbers', (done) => {
      const testData = { count: 42 };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe((result) => {
          expect(result.count).toBe(42);
          expect(typeof result.count).toBe('number');
          done();
        });
    });

    it('should not transform booleans', (done) => {
      const testData = { active: true };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe((result) => {
          expect(result.active).toBe(true);
          expect(typeof result.active).toBe('boolean');
          done();
        });
    });

    it('should preserve null values', (done) => {
      const testData = { value: null };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe((result) => {
          expect(result.value).toBeNull();
          done();
        });
    });

    it('should preserve undefined values', (done) => {
      const testData = { value: undefined };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe((result) => {
          expect(result.value).toBeUndefined();
          done();
        });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null response', (done) => {
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(null));

      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe((result) => {
          expect(result).toBeNull();
          done();
        });
    });

    it('should handle undefined response', (done) => {
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(undefined));

      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe((result) => {
          expect(result).toBeUndefined();
          done();
        });
    });

    it('should handle empty array', (done) => {
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of([]));

      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe((result) => {
          expect(Array.isArray(result)).toBe(true);
          expect(result).toHaveLength(0);
          done();
        });
    });

    it('should handle empty object', (done) => {
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of({}));

      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe((result) => {
          expect(result).toEqual({});
          done();
        });
    });

    it('should handle deeply nested structures', (done) => {
      const testData = {
        level1: {
          level2: {
            level3: {
              date: new Date('2025-11-14T10:30:00.000Z'),
            },
          },
        },
      };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe((result) => {
          expect(typeof result.level1.level2.level3.date).toBe('string');
          done();
        });
    });

    it('should handle array of nested objects', (done) => {
      const testData = [
        {
          company: {
            createdAt: new Date('2025-11-14T10:30:00.000Z'),
          },
        },
        {
          company: {
            createdAt: new Date('2025-11-15T10:30:00.000Z'),
          },
        },
      ];
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe((result) => {
          expect(typeof result[0].company.createdAt).toBe('string');
          expect(typeof result[1].company.createdAt).toBe('string');
          done();
        });
    });
  });

  describe('Timezone Format', () => {
    it('should include timezone offset in formatted date', (done) => {
      const testDate = new Date('2025-11-14T10:30:00.000Z');
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testDate));

      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe((result) => {
          // Should include UTC offset (-03:00 or -02:00 depending on DST)
          expect(result).toMatch(/-0[23]:00$/);
          done();
        });
    });

    it('should format dates consistently', (done) => {
      const testData = {
        date1: new Date('2025-11-14T10:30:00.000Z'),
        date2: new Date('2025-11-14T10:30:00.000Z'),
      };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe((result) => {
          // Same input date should produce same output format
          expect(result.date1).toBe(result.date2);
          done();
        });
    });

    it('should use configured timezone', (done) => {
      const testDate = new Date('2025-11-14T10:30:00.000Z');
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testDate));

      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe((result) => {
          // Result should be a valid ISO 8601 string with timezone
          expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
          done();
        });
    });
  });

  describe('Complex Data Structures', () => {
    it('should handle mixed data types', (done) => {
      const testData = {
        id: 123,
        name: 'Test',
        active: true,
        date: new Date('2025-11-14T10:30:00.000Z'),
        tags: ['tag1', 'tag2'],
        metadata: {
          createdAt: new Date('2025-11-14T10:30:00.000Z'),
        },
      };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe((result) => {
          expect(result.id).toBe(123);
          expect(result.name).toBe('Test');
          expect(result.active).toBe(true);
          expect(typeof result.date).toBe('string');
          expect(Array.isArray(result.tags)).toBe(true);
          expect(typeof result.metadata.createdAt).toBe('string');
          done();
        });
    });

    it('should handle pagination responses', (done) => {
      const testData = {
        data: [
          { id: '1', createdAt: new Date('2025-11-14T10:30:00.000Z') },
          { id: '2', createdAt: new Date('2025-11-15T10:30:00.000Z') },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
        },
      };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor
        .intercept(
          mockExecutionContext as ExecutionContext,
          mockCallHandler as CallHandler,
        )
        .subscribe((result) => {
          expect(Array.isArray(result.data)).toBe(true);
          expect(typeof result.data[0].createdAt).toBe('string');
          expect(typeof result.data[1].createdAt).toBe('string');
          expect(result.meta.total).toBe(2);
          done();
        });
    });
  });
});

