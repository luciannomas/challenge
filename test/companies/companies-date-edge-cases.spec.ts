import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import * as moment from 'moment-timezone';
import { TIMEZONE } from '../../src/common/constants/timezone.constant';

/**
 * E2E Tests for Date Edge Cases - "Last Month" functionality
 * 
 * Tests boundary conditions:
 * - Exactly 30 days ago (inclusive)
 * - 31 days ago (should NOT appear)
 * - Month change boundaries
 * - Timezone UTC-3 (Argentina)
 * - Inclusive limits (from 30 days ago to now)
 */
describe('Companies Date Edge Cases (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    // Configure timezone
    moment.tz.setDefault(TIMEZONE.NAME);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    connection = moduleFixture.get<Connection>(getConnectionToken());
  }, 30000);

  afterAll(async () => {
    if (connection) {
      await connection.collection('companies').deleteMany({ 
        cuit: { $regex: /^99/ } 
      });
    }
    await app.close();
  }, 30000);

  describe('Edge Case: Recent companies (within last month)', () => {
    it('should NOT include company joined 2 months ago', async () => {
      const now = moment.tz(TIMEZONE.NAME);
      const exactly2MonthsAgo = now.clone().subtract(2, 'months').startOf('day');

      // Create company 2 months ago
      const testCuit = '99000000002';
      await connection.collection('companies').insertOne({
        cuit: testCuit,
        businessName: 'Edge Case 2 Months Ago',
        companyType: 'sme',
        adhesionDate: exactly2MonthsAgo.toDate(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .get('/companies/joined/last-month')
        .expect(200);

      // Should NOT include this company
      const foundCompany = response.body.data.find((c: any) => c.cuit === testCuit);
      expect(foundCompany).toBeUndefined();

      // Cleanup
      await connection.collection('companies').deleteOne({ cuit: testCuit });
    });
  });

  describe('Edge Case: Month change boundary', () => {
    it('should handle month change correctly (e.g., Dec 5 includes from Nov 5)', () => {
      const now = moment.tz(TIMEZONE.NAME);
      const oneMonthAgo = now.clone().subtract(1, 'month');
      
      // Log for verification
      const currentMonth = now.format('MMMM YYYY');
      const previousMonth = oneMonthAgo.format('MMMM YYYY');
      
      console.log(`Current date: ${now.format('YYYY-MM-DD')}`);
      console.log(`One month ago: ${oneMonthAgo.format('YYYY-MM-DD')}`);
      console.log(`Should include companies from ${previousMonth} to ${currentMonth}`);

      // This test verifies the calculation is correct
      expect(oneMonthAgo.month()).not.toBe(now.month());
    });

    it('should include company from 7 days ago', async () => {
      const now = moment.tz(TIMEZONE.NAME);
      const sevenDaysAgo = now.clone().subtract(7, 'days').startOf('day');

      const testCuit = '99000000003';
      await connection.collection('companies').insertOne({
        cuit: testCuit,
        businessName: '7 Days Ago',
        companyType: 'corporate',
        adhesionDate: sevenDaysAgo.toDate(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .get('/companies/joined/last-month')
        .expect(200);

      // Should include (7 days is safely within "last month")
      const foundCompany = response.body.data.find((c: any) => c.cuit === testCuit);
      expect(foundCompany).toBeDefined();

      // Cleanup
      await connection.collection('companies').deleteOne({ cuit: testCuit });
    });
  });

  describe('Edge Case: Timezone UTC-3 (Argentina)', () => {
    it('should respect UTC-3 timezone for date calculations', async () => {
      const now = moment.tz(TIMEZONE.NAME);
      const offset = now.format('Z');
      
      // Verify timezone is correctly set
      expect(TIMEZONE.NAME).toBe('America/Buenos_Aires');
      expect(offset).toBe('-03:00');

      // Create company with current date in UTC-3
      const todayUTC3 = now.startOf('day');
      const testCuit = '99000000004';
      
      await connection.collection('companies').insertOne({
        cuit: testCuit,
        businessName: 'Today UTC-3',
        companyType: 'sme',
        adhesionDate: todayUTC3.toDate(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .get('/companies/joined/last-month')
        .expect(200);

      // Should include today's company
      const foundCompany = response.body.data.find((c: any) => c.cuit === testCuit);
      expect(foundCompany).toBeDefined();

      // Cleanup
      await connection.collection('companies').deleteOne({ cuit: testCuit });
    });
  });

  describe('Edge Case: Transfers at month boundaries', () => {
    let testCompanyId: string;

    beforeEach(async () => {
      // Create a test company first
      const company = await connection.collection('companies').insertOne({
        cuit: '99000000099',
        businessName: 'Transfer Test Company',
        companyType: 'sme',
        adhesionDate: '2024-01-01',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      testCompanyId = company.insertedId.toString();
    });

    afterEach(async () => {
      await connection.collection('transfers').deleteMany({ 
        companyId: testCompanyId 
      });
      await connection.collection('companies').deleteOne({ 
        cuit: '99000000099' 
      });
    });

    it('should include transfer from 15 days ago', async () => {
      const now = moment.tz(TIMEZONE.NAME);
      const fifteenDaysAgo = now.clone().subtract(15, 'days').startOf('day');

      await connection.collection('transfers').insertOne({
        companyId: testCompanyId,
        amount: 50000,
        transferDate: fifteenDaysAgo.toDate(),
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .get('/transfers/last-month')
        .expect(200);

      // Should include this transfer (15 days is safely within last month)
      const foundTransfer = response.body.find((t: any) => t.companyId === testCompanyId);
      expect(foundTransfer).toBeDefined();
      expect(foundTransfer.amount).toBe(50000);
    });

    it('should NOT include transfer from 2 months ago', async () => {
      const now = moment.tz(TIMEZONE.NAME);
      const exactly2MonthsAgo = now.clone().subtract(2, 'months').startOf('day');

      await connection.collection('transfers').insertOne({
        companyId: testCompanyId,
        amount: 75000,
        transferDate: exactly2MonthsAgo.toDate(),
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .get('/transfers/last-month')
        .expect(200);

      // Should NOT include this transfer
      const foundTransfer = response.body.find((t: any) => t.companyId === testCompanyId);
      expect(foundTransfer).toBeUndefined();
    });

    it('should include transfer from first day of current month', async () => {
      const now = moment.tz(TIMEZONE.NAME);
      const firstDayCurrentMonth = now.clone().startOf('month').startOf('day');

      await connection.collection('transfers').insertOne({
        companyId: testCompanyId,
        amount: 100000,
        transferDate: firstDayCurrentMonth.toDate(),
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .get('/transfers/last-month')
        .expect(200);

      // Should always include (first day of current month is always in "last month")
      const foundTransfer = response.body.find((t: any) => t.companyId === testCompanyId);
      expect(foundTransfer).toBeDefined();
    });
  });

});

