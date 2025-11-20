import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import * as moment from 'moment-timezone';
import { TIMEZONE } from '../../src/common/constants/timezone.constant';

// Set AUTH_TOKEN for tests
process.env.AUTH_TOKEN = 'Bearer_mK7pL9xR4tN2wQ8vZ3jH6yF5sA1cE0bD';

describe('Companies Controller (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let testCompanyId: string;
  const AUTH_TOKEN = process.env.AUTH_TOKEN;

  beforeAll(async () => {
    // Configure timezone
    moment.tz.setDefault(TIMEZONE.NAME);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply global pipes (same as main.ts)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    // Get database connection for cleanup
    connection = moduleFixture.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    // Clean up test data
    if (connection) {
      await connection.collection('companies').deleteMany({ 
        cuit: { $regex: /^99/ } // Delete only test companies
      });
    }
    await app.close();
  });

  describe('POST /companies/adhesion', () => {
    describe('Authentication', () => {
      it('should reject request without Authorization header', () => {
        return request(app.getHttpServer())
          .post('/companies/adhesion')
          .send({
            cuit: '99111222333',
            businessName: 'Test Company SA',
            companyType: 'sme',
            adhesionDate: '2025-11-14',
          })
          .expect(401)
          .expect((res) => {
            expect(res.body.message).toBe('Authorization header is required');
          });
      });

      it('should reject request with invalid token format', () => {
        return request(app.getHttpServer())
          .post('/companies/adhesion')
          .set('Authorization', 'InvalidFormat')
          .send({
            cuit: '99111222333',
            businessName: 'Test Company SA',
            companyType: 'sme',
            adhesionDate: '2025-11-14',
          })
          .expect(401)
          .expect((res) => {
            expect(res.body.message).toBe('Invalid authorization format. Use "Bearer <token>"');
          });
      });

      it('should reject request with invalid token', () => {
        return request(app.getHttpServer())
          .post('/companies/adhesion')
          .set('Authorization', 'Bearer wrongtoken')
          .send({
            cuit: '99111222333',
            businessName: 'Test Company SA',
            companyType: 'sme',
            adhesionDate: '2025-11-14',
          })
          .expect(401)
          .expect((res) => {
            expect(res.body.message).toBe('Invalid authentication token');
          });
      });
    });

    describe('Validation', () => {
      it('should reject invalid CUIT (not 11 digits)', () => {
        return request(app.getHttpServer())
          .post('/companies/adhesion')
          .set('Authorization', `Bearer ${AUTH_TOKEN}`)
          .send({
            cuit: '123', // Invalid CUIT
            businessName: 'Test Company SA',
            companyType: 'sme',
            adhesionDate: '2025-11-14',
          })
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toContain('CUIT must be 11 digits');
          });
      });

      it('should reject businessName shorter than 3 characters', () => {
        return request(app.getHttpServer())
          .post('/companies/adhesion')
          .set('Authorization', `Bearer ${AUTH_TOKEN}`)
          .send({
            cuit: '99111222333',
            businessName: 'AB', // Too short
            companyType: 'sme',
            adhesionDate: '2025-11-14',
          })
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toContain('Business name must be at least 3 characters long');
          });
      });

      it('should reject businessName longer than 100 characters', () => {
        return request(app.getHttpServer())
          .post('/companies/adhesion')
          .set('Authorization', `Bearer ${AUTH_TOKEN}`)
          .send({
            cuit: '99111222333',
            businessName: 'A'.repeat(101), // Too long
            companyType: 'sme',
            adhesionDate: '2025-11-14',
          })
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toContain('Business name must not exceed 100 characters');
          });
      });

      it('should reject invalid companyType', () => {
        return request(app.getHttpServer())
          .post('/companies/adhesion')
          .set('Authorization', `Bearer ${AUTH_TOKEN}`)
          .send({
            cuit: '99111222333',
            businessName: 'Test Company SA',
            companyType: 'invalid', // Invalid type
            adhesionDate: '2025-11-14',
          })
          .expect(400);
      });

      it('should reject invalid adhesionDate format', () => {
        return request(app.getHttpServer())
          .post('/companies/adhesion')
          .set('Authorization', `Bearer ${AUTH_TOKEN}`)
          .send({
            cuit: '99111222333',
            businessName: 'Test Company SA',
            companyType: 'sme',
            adhesionDate: '14-11-2025', // Wrong format
          })
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toContain('Adhesion date must be in format YYYY-MM-DD (e.g., 2025-11-13)');
          });
      });

      it('should reject missing required fields', () => {
        return request(app.getHttpServer())
          .post('/companies/adhesion')
          .set('Authorization', `Bearer ${AUTH_TOKEN}`)
          .send({
            cuit: '99111222333',
            // Missing businessName, companyType, adhesionDate
          })
          .expect(400);
      });
    });

    describe('Success cases', () => {
      it('should create SME company successfully', () => {
        return request(app.getHttpServer())
          .post('/companies/adhesion')
          .set('Authorization', `Bearer ${AUTH_TOKEN}`)
          .send({
            cuit: '99111222333',
            businessName: 'Test SME Company SA',
            companyType: 'sme',
            adhesionDate: '2025-11-14',
          })
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('id');
            expect(res.body.cuit).toBe('99111222333');
            expect(res.body.businessName).toBe('Test SME Company SA');
            expect(res.body.companyType).toBe('sme');
            expect(res.body).toHaveProperty('adhesionDate');
            // Should NOT have createdAt and updatedAt
            expect(res.body).not.toHaveProperty('createdAt');
            expect(res.body).not.toHaveProperty('updatedAt');
            testCompanyId = res.body.id;
          });
      });

      it('should create Corporate company successfully', () => {
        return request(app.getHttpServer())
          .post('/companies/adhesion')
          .set('Authorization', `Bearer ${AUTH_TOKEN}`)
          .send({
            cuit: '99222333444',
            businessName: 'Test Corporate Company SA',
            companyType: 'corporate',
            adhesionDate: '2025-11-14',
          })
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('id');
            expect(res.body.cuit).toBe('99222333444');
            expect(res.body.businessName).toBe('Test Corporate Company SA');
            expect(res.body.companyType).toBe('corporate');
            expect(res.body).toHaveProperty('adhesionDate');
          });
      });

      it('should reject duplicate CUIT', () => {
        return request(app.getHttpServer())
          .post('/companies/adhesion')
          .set('Authorization', `Bearer ${AUTH_TOKEN}`)
          .send({
            cuit: '99111222333', // Already exists
            businessName: 'Another Company',
            companyType: 'sme',
            adhesionDate: '2025-11-14',
          })
          .expect(409);
      });
    });
  });

  describe('GET /companies/with-transfers/last-month', () => {
    describe('Pagination', () => {
      it('should return paginated transfers with default values', () => {
        return request(app.getHttpServer())
          .get('/companies/with-transfers/last-month')
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('data');
            expect(res.body).toHaveProperty('meta');
            expect(res.body.meta).toHaveProperty('total');
            expect(res.body.meta).toHaveProperty('page');
            expect(res.body.meta).toHaveProperty('limit');
            expect(res.body.meta).toHaveProperty('totalPages');
            expect(res.body.meta.page).toBe(1);
            expect(res.body.meta.limit).toBe(10);
            expect(Array.isArray(res.body.data)).toBe(true);
          });
      });

      it('should return paginated transfers with custom page and limit', () => {
        return request(app.getHttpServer())
          .get('/companies/with-transfers/last-month')
          .query({ page: 1, limit: 5 })
          .expect(200)
          .expect((res) => {
            expect(res.body.meta.page).toBe(1);
            expect(res.body.meta.limit).toBe(5);
            expect(res.body.data.length).toBeLessThanOrEqual(5);
          });
      });

      it('should enforce maximum limit of 100', () => {
        return request(app.getHttpServer())
          .get('/companies/with-transfers/last-month')
          .query({ page: 1, limit: 500 })
          .expect(200)
          .expect((res) => {
            expect(res.body.meta.limit).toBe(10); // Falls back to default
          });
      });

      it('should handle invalid page number gracefully', () => {
        return request(app.getHttpServer())
          .get('/companies/with-transfers/last-month')
          .query({ page: -1, limit: 10 })
          .expect(200)
          .expect((res) => {
            expect(res.body.meta.page).toBe(1); // Falls back to 1
          });
      });
    });

    describe('Response structure', () => {
      it('should return transfers without transferDate field', () => {
        return request(app.getHttpServer())
          .get('/companies/with-transfers/last-month')
          .expect(200)
          .expect((res) => {
            if (res.body.data.length > 0) {
              const transfer = res.body.data[0];
              expect(transfer).toHaveProperty('id');
              expect(transfer).toHaveProperty('companyId');
              expect(transfer).toHaveProperty('amount');
              expect(transfer).toHaveProperty('debitAccount');
              expect(transfer).toHaveProperty('creditAccount');
              expect(transfer).not.toHaveProperty('transferDate');
            }
          });
      });
    });

    describe('Rate Limiting', () => {
      it('should block after 5 requests in 30 seconds', async () => {
        // Wait for previous rate limits to fully expire (30s window + 10s block + 1s buffer)
        await new Promise(resolve => setTimeout(resolve, 41000));

        // Make 5 successful requests
        for (let i = 0; i < 5; i++) {
          await request(app.getHttpServer())
            .get('/companies/with-transfers/last-month')
            .expect(200);
        }

        // 6th request should be blocked
        return request(app.getHttpServer())
          .get('/companies/with-transfers/last-month')
          .expect(429)
          .expect((res) => {
            expect(res.body.statusCode).toBe(429);
            expect(res.body.message).toContain('Acceso denegado');
          });
      }, 50000); // Increase timeout to 50 seconds (41s wait + 9s execution)
    });
  });

  describe('GET /companies/joined/last-month', () => {
    describe('Pagination', () => {
      it('should return paginated companies with default values', async () => {
        // Wait for rate limit to reset
        await new Promise(resolve => setTimeout(resolve, 11000));
        
        return request(app.getHttpServer())
          .get('/companies/joined/last-month')
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('data');
            expect(res.body).toHaveProperty('meta');
            expect(res.body.meta).toHaveProperty('total');
            expect(res.body.meta).toHaveProperty('page');
            expect(res.body.meta).toHaveProperty('limit');
            expect(res.body.meta).toHaveProperty('totalPages');
            expect(res.body.meta.page).toBe(1);
            expect(res.body.meta.limit).toBe(10);
            expect(Array.isArray(res.body.data)).toBe(true);
          });
      }, 15000);

      it('should return paginated companies with custom page and limit', () => {
        return request(app.getHttpServer())
          .get('/companies/joined/last-month')
          .query({ page: 1, limit: 5 })
          .expect(200)
          .expect((res) => {
            expect(res.body.meta.page).toBe(1);
            expect(res.body.meta.limit).toBe(5);
            expect(res.body.data.length).toBeLessThanOrEqual(5);
          });
      });
    });

    describe('Response structure', () => {
      it('should return only required fields', () => {
        return request(app.getHttpServer())
          .get('/companies/joined/last-month')
          .expect(200)
          .expect((res) => {
            if (res.body.data.length > 0) {
              const company = res.body.data[0];
              expect(company).toHaveProperty('id');
              expect(company).toHaveProperty('cuit');
              expect(company).toHaveProperty('businessName');
              expect(company).toHaveProperty('companyType');
              expect(company).toHaveProperty('adhesionDate');
              // Should NOT have createdAt and updatedAt
              expect(company).not.toHaveProperty('createdAt');
              expect(company).not.toHaveProperty('updatedAt');
            }
          });
      });
    });

    describe('Rate Limiting', () => {
      it('should block after 5 requests in 30 seconds', async () => {
        // Wait for rate limit to fully reset from previous tests (30s window + 10s block + 1s buffer)
        await new Promise(resolve => setTimeout(resolve, 41000));

        // Make 5 successful requests
        for (let i = 0; i < 5; i++) {
          await request(app.getHttpServer())
            .get('/companies/joined/last-month')
            .expect(200);
        }

        // 6th request should be blocked
        return request(app.getHttpServer())
          .get('/companies/joined/last-month')
          .expect(429)
          .expect((res) => {
            expect(res.body.statusCode).toBe(429);
            expect(res.body.message).toContain('Acceso denegado');
          });
      }, 50000); // Increase timeout to 50 seconds (41s wait + 9s execution)
    });
  });

});

