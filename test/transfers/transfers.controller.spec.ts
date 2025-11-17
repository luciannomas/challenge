import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { TransfersModule } from '../../src/transfers/transfers.module';
import { CompaniesModule } from '../../src/companies/companies.module';
import * as moment from 'moment-timezone';
import { TIMEZONE } from '../../src/common/constants/timezone.constant';

describe('TransfersController (E2E)', () => {
  let app: INestApplication;
  let testCompanyId: string;
  let mongoConnection: Connection;

  beforeAll(async () => {
    // Configure timezone
    moment.tz.setDefault(TIMEZONE.NAME);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/interbanking-test'),
        CompaniesModule,
        TransfersModule,
      ],
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

    // Get MongoDB connection
    mongoConnection = moduleFixture.get<Connection>(getConnectionToken());

    // Create a test company for transfers
    const companyResponse = await request(app.getHttpServer())
      .post('/companies/adhesion')
      .set('Authorization', 'Bearer asdasdsafd')
      .send({
        cuit: '20999888777',
        businessName: 'Test Transfer Company SA',
        companyType: 'sme',
        adhesionDate: moment.tz(TIMEZONE.NAME).format('YYYY-MM-DD'),
      });

    testCompanyId = companyResponse.body.id;
  }, 30000);

  afterAll(async () => {
    // Clean up test data
    if (mongoConnection && mongoConnection.readyState === 1) {
      await mongoConnection.collection('companies').deleteMany({ 
        cuit: { $regex: /^20999/ } 
      });
      await mongoConnection.collection('transfers').deleteMany({ 
        companyId: testCompanyId 
      });
    }
    
    if (app) {
      await app.close();
    }
  }, 30000);

  describe('POST /transfers', () => {
    describe('Success Cases', () => {
      it('should create a new transfer successfully', async () => {
        const transferData = {
          companyId: testCompanyId,
          amount: 50000.75,
          debitAccount: '1234567890123456',
          creditAccount: '6543210987654321',
          transferDate: moment.tz(TIMEZONE.NAME).format('YYYY-MM-DD'),
        };

        return request(app.getHttpServer())
          .post('/transfers')
          .send(transferData)
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('id');
            expect(res.body.companyId).toBe(transferData.companyId);
            expect(res.body.amount).toBe(transferData.amount);
            expect(res.body.debitAccount).toBe(transferData.debitAccount);
            expect(res.body.creditAccount).toBe(transferData.creditAccount);
            expect(res.body).toHaveProperty('transferDate');
          });
      });

      it('should create transfer with large amount', async () => {
        const transferData = {
          companyId: testCompanyId,
          amount: 9999999.99,
          debitAccount: '1111111111111111',
          creditAccount: '2222222222222222',
          transferDate: moment.tz(TIMEZONE.NAME).format('YYYY-MM-DD'),
        };

        return request(app.getHttpServer())
          .post('/transfers')
          .send(transferData)
          .expect(201)
          .expect((res) => {
            expect(res.body.amount).toBe(transferData.amount);
          });
      });

      it('should create transfer with small amount', async () => {
        const transferData = {
          companyId: testCompanyId,
          amount: 0.01,
          debitAccount: '3333333333333333',
          creditAccount: '4444444444444444',
          transferDate: moment.tz(TIMEZONE.NAME).format('YYYY-MM-DD'),
        };

        return request(app.getHttpServer())
          .post('/transfers')
          .send(transferData)
          .expect(201)
          .expect((res) => {
            expect(res.body.amount).toBe(transferData.amount);
          });
      });
    });

    describe('Validation Errors', () => {
      it('should reject transfer without companyId', async () => {
        const transferData = {
          amount: 50000,
          debitAccount: '1234567890123456',
          creditAccount: '6543210987654321',
          transferDate: moment.tz(TIMEZONE.NAME).format('YYYY-MM-DD'),
        };

        return request(app.getHttpServer())
          .post('/transfers')
          .send(transferData)
          .expect(400)
          .expect((res) => {
            expect(res.body.statusCode).toBe(400);
            expect(res.body.message).toBeDefined();
          });
      });

      it('should reject transfer without amount', async () => {
        const transferData = {
          companyId: testCompanyId,
          debitAccount: '1234567890123456',
          creditAccount: '6543210987654321',
          transferDate: moment.tz(TIMEZONE.NAME).format('YYYY-MM-DD'),
        };

        return request(app.getHttpServer())
          .post('/transfers')
          .send(transferData)
          .expect(400)
          .expect((res) => {
            expect(res.body.statusCode).toBe(400);
            expect(res.body.message).toBeDefined();
          });
      });

      it('should reject transfer with negative amount', async () => {
        const transferData = {
          companyId: testCompanyId,
          amount: -1000,
          debitAccount: '1234567890123456',
          creditAccount: '6543210987654321',
          transferDate: moment.tz(TIMEZONE.NAME).format('YYYY-MM-DD'),
        };

        return request(app.getHttpServer())
          .post('/transfers')
          .send(transferData)
          .expect(400)
          .expect((res) => {
            expect(res.body.statusCode).toBe(400);
            expect(res.body.message).toBeDefined();
          });
      });

      it('should reject transfer with zero amount', async () => {
        const transferData = {
          companyId: testCompanyId,
          amount: 0,
          debitAccount: '1234567890123456',
          creditAccount: '6543210987654321',
          transferDate: moment.tz(TIMEZONE.NAME).format('YYYY-MM-DD'),
        };

        return request(app.getHttpServer())
          .post('/transfers')
          .send(transferData)
          .expect(400)
          .expect((res) => {
            expect(res.body.statusCode).toBe(400);
            expect(res.body.message).toBeDefined();
          });
      });

      it('should reject transfer without debitAccount', async () => {
        const transferData = {
          companyId: testCompanyId,
          amount: 50000,
          creditAccount: '6543210987654321',
          transferDate: moment.tz(TIMEZONE.NAME).format('YYYY-MM-DD'),
        };

        return request(app.getHttpServer())
          .post('/transfers')
          .send(transferData)
          .expect(400)
          .expect((res) => {
            expect(res.body.statusCode).toBe(400);
            expect(res.body.message).toBeDefined();
          });
      });

      it('should reject transfer without creditAccount', async () => {
        const transferData = {
          companyId: testCompanyId,
          amount: 50000,
          debitAccount: '1234567890123456',
          transferDate: moment.tz(TIMEZONE.NAME).format('YYYY-MM-DD'),
        };

        return request(app.getHttpServer())
          .post('/transfers')
          .send(transferData)
          .expect(400)
          .expect((res) => {
            expect(res.body.statusCode).toBe(400);
            expect(res.body.message).toBeDefined();
          });
      });

      it('should reject transfer without transferDate', async () => {
        const transferData = {
          companyId: testCompanyId,
          amount: 50000,
          debitAccount: '1234567890123456',
          creditAccount: '6543210987654321',
        };

        return request(app.getHttpServer())
          .post('/transfers')
          .send(transferData)
          .expect(400)
          .expect((res) => {
            expect(res.body.statusCode).toBe(400);
            expect(res.body.message).toBeDefined();
          });
      });

      it('should reject transfer with invalid transferDate format', async () => {
        const transferData = {
          companyId: testCompanyId,
          amount: 50000,
          debitAccount: '1234567890123456',
          creditAccount: '6543210987654321',
          transferDate: '13/11/2025',
        };

        return request(app.getHttpServer())
          .post('/transfers')
          .send(transferData)
          .expect(400)
          .expect((res) => {
            expect(res.body.statusCode).toBe(400);
            expect(res.body.message).toBeDefined();
          });
      });

      it('should reject transfer with empty companyId', async () => {
        const transferData = {
          companyId: '',
          amount: 50000,
          debitAccount: '1234567890123456',
          creditAccount: '6543210987654321',
          transferDate: moment.tz(TIMEZONE.NAME).format('YYYY-MM-DD'),
        };

        return request(app.getHttpServer())
          .post('/transfers')
          .send(transferData)
          .expect(400)
          .expect((res) => {
            expect(res.body.statusCode).toBe(400);
            expect(res.body.message).toBeDefined();
          });
      });

      it('should reject transfer with empty debitAccount', async () => {
        const transferData = {
          companyId: testCompanyId,
          amount: 50000,
          debitAccount: '',
          creditAccount: '6543210987654321',
          transferDate: moment.tz(TIMEZONE.NAME).format('YYYY-MM-DD'),
        };

        return request(app.getHttpServer())
          .post('/transfers')
          .send(transferData)
          .expect(400)
          .expect((res) => {
            expect(res.body.statusCode).toBe(400);
            expect(res.body.message).toBeDefined();
          });
      });

      it('should reject transfer with empty creditAccount', async () => {
        const transferData = {
          companyId: testCompanyId,
          amount: 50000,
          debitAccount: '1234567890123456',
          creditAccount: '',
          transferDate: moment.tz(TIMEZONE.NAME).format('YYYY-MM-DD'),
        };

        return request(app.getHttpServer())
          .post('/transfers')
          .send(transferData)
          .expect(400)
          .expect((res) => {
            expect(res.body.statusCode).toBe(400);
            expect(res.body.message).toBeDefined();
          });
      });
    });

    describe('Type Validation', () => {
      it('should reject transfer with non-string companyId', async () => {
        const transferData = {
          companyId: 123456,
          amount: 50000,
          debitAccount: '1234567890123456',
          creditAccount: '6543210987654321',
          transferDate: moment.tz(TIMEZONE.NAME).format('YYYY-MM-DD'),
        };

        return request(app.getHttpServer())
          .post('/transfers')
          .send(transferData)
          .expect(400);
      });

      it('should reject transfer with non-number amount', async () => {
        const transferData = {
          companyId: testCompanyId,
          amount: '50000',
          debitAccount: '1234567890123456',
          creditAccount: '6543210987654321',
          transferDate: moment.tz(TIMEZONE.NAME).format('YYYY-MM-DD'),
        };

        return request(app.getHttpServer())
          .post('/transfers')
          .send(transferData)
          .expect(400);
      });

      it('should reject transfer with non-string debitAccount', async () => {
        const transferData = {
          companyId: testCompanyId,
          amount: 50000,
          debitAccount: 1234567890123456,
          creditAccount: '6543210987654321',
          transferDate: moment.tz(TIMEZONE.NAME).format('YYYY-MM-DD'),
        };

        return request(app.getHttpServer())
          .post('/transfers')
          .send(transferData)
          .expect(400);
      });

      it('should reject transfer with non-string creditAccount', async () => {
        const transferData = {
          companyId: testCompanyId,
          amount: 50000,
          debitAccount: '1234567890123456',
          creditAccount: 6543210987654321,
          transferDate: moment.tz(TIMEZONE.NAME).format('YYYY-MM-DD'),
        };

        return request(app.getHttpServer())
          .post('/transfers')
          .send(transferData)
          .expect(400);
      });
    });
  });

  describe('GET /transfers/last-month', () => {
    beforeAll(async () => {
      // Create test transfers for last month
      const currentDate = moment.tz(TIMEZONE.NAME);
      
      // Recent transfer (last month)
      await request(app.getHttpServer())
        .post('/transfers')
        .send({
          companyId: testCompanyId,
          amount: 10000,
          debitAccount: '5555555555555555',
          creditAccount: '6666666666666666',
          transferDate: currentDate.clone().subtract(15, 'days').format('YYYY-MM-DD'),
        });

      // Old transfer (2 months ago)
      await request(app.getHttpServer())
        .post('/transfers')
        .send({
          companyId: testCompanyId,
          amount: 20000,
          debitAccount: '7777777777777777',
          creditAccount: '8888888888888888',
          transferDate: currentDate.clone().subtract(45, 'days').format('YYYY-MM-DD'),
        });
    }, 30000);

    describe('Success Cases', () => {
      it('should return transfers from last month', async () => {
        return request(app.getHttpServer())
          .get('/transfers/last-month')
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
          });
      });

      it('should return transfers with correct structure', async () => {
        return request(app.getHttpServer())
          .get('/transfers/last-month')
          .expect(200)
          .expect((res) => {
            if (res.body.length > 0) {
              const transfer = res.body[0];
              expect(transfer).toHaveProperty('id');
              expect(transfer).toHaveProperty('companyId');
              expect(transfer).toHaveProperty('amount');
              expect(transfer).toHaveProperty('debitAccount');
              expect(transfer).toHaveProperty('creditAccount');
              expect(transfer).toHaveProperty('transferDate');
            }
          });
      });

      it('should return transfers with valid amounts', async () => {
        return request(app.getHttpServer())
          .get('/transfers/last-month')
          .expect(200)
          .expect((res) => {
            res.body.forEach((transfer: any) => {
              expect(typeof transfer.amount).toBe('number');
              expect(transfer.amount).toBeGreaterThan(0);
            });
          });
      });

      it('should return transfers with valid dates', async () => {
        return request(app.getHttpServer())
          .get('/transfers/last-month')
          .expect(200)
          .expect((res) => {
            res.body.forEach((transfer: any) => {
              expect(transfer.transferDate).toBeDefined();
              const transferDate = moment(transfer.transferDate);
              expect(transferDate.isValid()).toBe(true);
            });
          });
      });

      it('should return transfers within last month range', async () => {
        return request(app.getHttpServer())
          .get('/transfers/last-month')
          .expect(200)
          .expect((res) => {
            const oneMonthAgo = moment.tz(TIMEZONE.NAME).subtract(1, 'month');
            
            res.body.forEach((transfer: any) => {
              const transferDate = moment(transfer.transferDate);
              expect(transferDate.isAfter(oneMonthAgo)).toBe(true);
            });
          });
      });
    });

    describe('Response Format', () => {
      it('should return array even if empty', async () => {
        return request(app.getHttpServer())
          .get('/transfers/last-month')
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body)).toBe(true);
          });
      });

      it('should return transfers with string account numbers', async () => {
        return request(app.getHttpServer())
          .get('/transfers/last-month')
          .expect(200)
          .expect((res) => {
            if (res.body.length > 0) {
              res.body.forEach((transfer: any) => {
                expect(typeof transfer.debitAccount).toBe('string');
                expect(typeof transfer.creditAccount).toBe('string');
              });
            }
          });
      });

      it('should return transfers with string companyId', async () => {
        return request(app.getHttpServer())
          .get('/transfers/last-month')
          .expect(200)
          .expect((res) => {
            if (res.body.length > 0) {
              res.body.forEach((transfer: any) => {
                expect(typeof transfer.companyId).toBe('string');
              });
            }
          });
      });
    });
  });

  describe('Timezone Configuration', () => {
    it('should return dates in configured timezone format', async () => {
      const transferData = {
        companyId: testCompanyId,
        amount: 75000,
        debitAccount: '9999999999999999',
        creditAccount: '0000000000000000',
        transferDate: moment.tz(TIMEZONE.NAME).format('YYYY-MM-DD'),
      };

      return request(app.getHttpServer())
        .post('/transfers')
        .send(transferData)
        .expect(201)
        .expect((res) => {
          expect(res.body.transferDate).toBeDefined();
          // Should include timezone offset
          expect(res.body.transferDate).toMatch(/-03:00/);
        });
    });

    it('should handle dates correctly across timezone boundaries', async () => {
      const specificDate = moment.tz('2025-11-14', TIMEZONE.NAME);
      
      const transferData = {
        companyId: testCompanyId,
        amount: 85000,
        debitAccount: '1111222233334444',
        creditAccount: '4444333322221111',
        transferDate: specificDate.format('YYYY-MM-DD'),
      };

      return request(app.getHttpServer())
        .post('/transfers')
        .send(transferData)
        .expect(201)
        .expect((res) => {
          const responseDate = moment(res.body.transferDate);
          expect(responseDate.isValid()).toBe(true);
        });
    });
  });

  describe('Edge Cases', () => {
    it('should handle transfers with very long account numbers', async () => {
      const transferData = {
        companyId: testCompanyId,
        amount: 12345.67,
        debitAccount: '12345678901234567890',
        creditAccount: '09876543210987654321',
        transferDate: moment.tz(TIMEZONE.NAME).format('YYYY-MM-DD'),
      };

      return request(app.getHttpServer())
        .post('/transfers')
        .send(transferData)
        .expect(201)
        .expect((res) => {
          expect(res.body.debitAccount).toBe(transferData.debitAccount);
          expect(res.body.creditAccount).toBe(transferData.creditAccount);
        });
    });

    it('should handle transfers with decimal amounts', async () => {
      const transferData = {
        companyId: testCompanyId,
        amount: 999.99,
        debitAccount: '1122334455667788',
        creditAccount: '8877665544332211',
        transferDate: moment.tz(TIMEZONE.NAME).format('YYYY-MM-DD'),
      };

      return request(app.getHttpServer())
        .post('/transfers')
        .send(transferData)
        .expect(201)
        .expect((res) => {
          expect(res.body.amount).toBe(transferData.amount);
        });
    });

    it('should handle future dates in transferDate', async () => {
      const futureDate = moment.tz(TIMEZONE.NAME).add(7, 'days');
      
      const transferData = {
        companyId: testCompanyId,
        amount: 50000,
        debitAccount: '5566778899001122',
        creditAccount: '2211009988776655',
        transferDate: futureDate.format('YYYY-MM-DD'),
      };

      return request(app.getHttpServer())
        .post('/transfers')
        .send(transferData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('transferDate');
        });
    });
  });
});

