import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment-timezone';
import { TIMEZONE } from '../constants/timezone.constant';

/**
 * Interceptor to convert all Date objects to UTC-3 timezone format
 */
@Injectable()
export class TimezoneInterceptor implements NestInterceptor {
  private readonly timezone = TIMEZONE.NAME;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.transformDates(data))
    );
  }

  private transformDates(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.transformDates(item));
    }

    // Handle Date objects
    if (data instanceof Date) {
      return moment(data).tz(this.timezone).format();
    }

    // Handle objects
    if (typeof data === 'object') {
      const transformed = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          transformed[key] = this.transformDates(data[key]);
        }
      }
      return transformed;
    }

    return data;
  }
}

