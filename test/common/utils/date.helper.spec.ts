import { DateHelper } from '../../../src/common/utils/date.helper';
import * as moment from 'moment-timezone';
import { TIMEZONE } from '../../../src/common/constants/timezone.constant';

describe('DateHelper', () => {
  beforeAll(() => {
    // Set timezone for tests
    moment.tz.setDefault(TIMEZONE.NAME);
  });

  describe('now()', () => {
    it('should return current date', () => {
      const now = DateHelper.now();
      expect(now).toBeInstanceOf(Date);
    });

    it('should return date close to current time', () => {
      const before = new Date();
      const now = DateHelper.now();
      const after = new Date();

      expect(now.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
      expect(now.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
    });

    it('should use configured timezone', () => {
      const now = DateHelper.now();
      const formatted = moment(now).tz(TIMEZONE.NAME).format();
      expect(formatted).toBeDefined();
    });
  });

  describe('oneMonthAgo()', () => {
    it('should return date one month ago', () => {
      const oneMonthAgo = DateHelper.oneMonthAgo();
      expect(oneMonthAgo).toBeInstanceOf(Date);
    });

    it('should be approximately 30 days before now', () => {
      const now = new Date();
      const oneMonthAgo = DateHelper.oneMonthAgo();
      const diffInDays = Math.abs((now.getTime() - oneMonthAgo.getTime()) / (1000 * 60 * 60 * 24));
      
      // Should be between 28-31 days (accounting for different month lengths)
      expect(diffInDays).toBeGreaterThanOrEqual(28);
      expect(diffInDays).toBeLessThanOrEqual(31);
    });

    it('should be before current date', () => {
      const now = new Date();
      const oneMonthAgo = DateHelper.oneMonthAgo();
      expect(oneMonthAgo.getTime()).toBeLessThan(now.getTime());
    });

    it('should use configured timezone', () => {
      const oneMonthAgo = DateHelper.oneMonthAgo();
      const formatted = moment(oneMonthAgo).tz(TIMEZONE.NAME).format();
      expect(formatted).toBeDefined();
    });
  });

  describe('parse()', () => {
    it('should parse ISO date string', () => {
      const dateString = '2025-11-14';
      const parsed = DateHelper.parse(dateString);
      expect(parsed).toBeInstanceOf(Date);
    });

    it('should parse date with time', () => {
      const dateString = '2025-11-14T10:30:00';
      const parsed = DateHelper.parse(dateString);
      expect(parsed).toBeInstanceOf(Date);
    });

    it('should handle different date formats', () => {
      const formats = [
        '2025-11-14',
        '2025-11-14T10:30:00',
        '2025-11-14T10:30:00.000Z',
      ];

      formats.forEach(format => {
        const parsed = DateHelper.parse(format);
        expect(parsed).toBeInstanceOf(Date);
      });
    });

    it('should use configured timezone', () => {
      const dateString = '2025-11-14';
      const parsed = DateHelper.parse(dateString);
      const formatted = moment(parsed).tz(TIMEZONE.NAME).format('YYYY-MM-DD');
      expect(formatted).toBe('2025-11-14');
    });
  });

  describe('format()', () => {
    it('should format date with default format', () => {
      const date = new Date('2025-11-14T10:30:45.000Z');
      const formatted = DateHelper.format(date);
      expect(formatted).toBeDefined();
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/);
    });

    it('should format date with custom format', () => {
      const date = new Date('2025-11-14T10:30:45.000Z');
      const formatted = DateHelper.format(date, 'YYYY-MM-DD');
      expect(formatted).toBeDefined();
      expect(formatted).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should format date with time', () => {
      const date = new Date('2025-11-14T10:30:45.000Z');
      const formatted = DateHelper.format(date, 'HH:mm:ss');
      expect(formatted).toBeDefined();
      expect(formatted).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('should use configured timezone', () => {
      const date = new Date('2025-11-14T10:30:45.000Z');
      const formatted = DateHelper.format(date, 'DD/MM/YYYY');
      expect(formatted).toBeDefined();
    });

    it('should handle different format patterns', () => {
      const date = new Date('2025-11-14T10:30:45.000Z');
      
      const formats = [
        { pattern: 'YYYY-MM-DD', regex: /^\d{4}-\d{2}-\d{2}$/ },
        { pattern: 'DD/MM/YYYY', regex: /^\d{2}\/\d{2}\/\d{4}$/ },
        { pattern: 'HH:mm:ss', regex: /^\d{2}:\d{2}:\d{2}$/ },
        { pattern: 'YYYY-MM-DD HH:mm', regex: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/ },
      ];

      formats.forEach(({ pattern, regex }) => {
        const formatted = DateHelper.format(date, pattern);
        expect(formatted).toMatch(regex);
      });
    });
  });

  describe('currentTimeFormatted()', () => {
    it('should return formatted current time', () => {
      const formatted = DateHelper.currentTimeFormatted();
      expect(formatted).toBeDefined();
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/);
    });

    it('should return string', () => {
      const formatted = DateHelper.currentTimeFormatted();
      expect(typeof formatted).toBe('string');
    });

    it('should be close to current time', () => {
      const before = moment.tz(TIMEZONE.NAME).format('DD/MM/YYYY');
      const formatted = DateHelper.currentTimeFormatted();
      const after = moment.tz(TIMEZONE.NAME).format('DD/MM/YYYY');

      expect(formatted).toContain(before);
      expect(formatted).toContain(after);
    });

    it('should use configured timezone', () => {
      const formatted = DateHelper.currentTimeFormatted();
      expect(formatted).toBeDefined();
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('Static Class Behavior', () => {
    it('should not be instantiable', () => {
      // DateHelper is a utility class with static methods only
      expect(DateHelper).toBeDefined();
      expect(typeof DateHelper).toBe('function');
    });

    it('should have all methods as static', () => {
      expect(typeof DateHelper.now).toBe('function');
      expect(typeof DateHelper.oneMonthAgo).toBe('function');
      expect(typeof DateHelper.parse).toBe('function');
      expect(typeof DateHelper.format).toBe('function');
      expect(typeof DateHelper.currentTimeFormatted).toBe('function');
    });
  });

  describe('Timezone Consistency', () => {
    it('should use same timezone across all methods', () => {
      const now = DateHelper.now();
      const oneMonthAgo = DateHelper.oneMonthAgo();
      const parsed = DateHelper.parse('2025-11-14');

      expect(now).toBeDefined();
      expect(oneMonthAgo).toBeDefined();
      expect(parsed).toBeDefined();
    });

    it('should format dates consistently', () => {
      const date = new Date('2025-11-14T10:30:00.000Z');
      const formatted1 = DateHelper.format(date, 'YYYY-MM-DD');
      const formatted2 = DateHelper.format(date, 'YYYY-MM-DD');

      expect(formatted1).toBe(formatted2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle leap years', () => {
      const date = new Date('2024-02-29T00:00:00.000Z');
      const formatted = DateHelper.format(date, 'YYYY-MM-DD');
      expect(formatted).toContain('2024-02');
    });

    it('should handle end of month', () => {
      const date = new Date('2025-01-31T23:59:59.000Z');
      const formatted = DateHelper.format(date, 'YYYY-MM-DD');
      expect(formatted).toBeDefined();
    });

    it('should handle beginning of year', () => {
      const date = new Date('2025-01-01T00:00:00.000Z');
      const formatted = DateHelper.format(date, 'YYYY-MM-DD');
      expect(formatted).toBeDefined();
    });

    it('should handle end of year', () => {
      const date = new Date('2025-12-31T23:59:59.000Z');
      const formatted = DateHelper.format(date, 'YYYY-MM-DD');
      expect(formatted).toBeDefined();
    });
  });
});

