import * as moment from 'moment-timezone';
import { TIMEZONE } from '../constants/timezone.constant';

/**
 * Date helper using moment-timezone configured for UTC-3 (Argentina)
 */
export class DateHelper {
  private static readonly TIMEZONE_NAME = TIMEZONE.NAME;

  /**
   * Get current date/time in configured timezone (UTC-3)
   */
  static now(): Date {
    return moment.tz(this.TIMEZONE_NAME).toDate();
  }

  /**
   * Get date one month ago from now
   */
  static oneMonthAgo(): Date {
    return moment.tz(this.TIMEZONE_NAME).subtract(1, 'month').toDate();
  }

  /**
   * Parse a date string to Date object in configured timezone
   */
  static parse(dateString: string): Date {
    return moment.tz(dateString, this.TIMEZONE_NAME).toDate();
  }

  /**
   * Format a date to configured timezone
   */
  static format(date: Date, format: string = 'DD/MM/YYYY HH:mm:ss'): string {
    return moment(date).tz(this.TIMEZONE_NAME).format(format);
  }

  /**
   * Get current time formatted
   */
  static currentTimeFormatted(): string {
    return moment.tz(this.TIMEZONE_NAME).format('DD/MM/YYYY HH:mm:ss');
  }
}

