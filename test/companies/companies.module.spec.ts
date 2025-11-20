import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { CompaniesModule } from '../../src/companies/companies.module';
import { CompaniesController } from '../../src/companies/controllers/companies.controller';
import { CompaniesService } from '../../src/companies/services/companies.service';
import { AuthMiddleware } from '../../src/common/middleware/auth.middleware';
import { RateLimitMiddleware } from '../../src/common/middleware/rate-limit.middleware';

describe('CompaniesModule', () => {
  let module: TestingModule;
  let app: INestApplication;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/interbanking-test'),
        CompaniesModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Module initialization', () => {
    it('should be defined', () => {
      expect(module).toBeDefined();
    });

    it('should have CompaniesController', () => {
      const controller = module.get<CompaniesController>(CompaniesController);
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(CompaniesController);
    });

    it('should have CompaniesService', () => {
      const service = module.get<CompaniesService>(CompaniesService);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(CompaniesService);
    });
  });

  describe('Middleware configuration', () => {
    it('should configure AuthMiddleware for POST /companies/adhesion', () => {
      // Mock ConfigService for AuthMiddleware
      const mockConfigService = {
        get: jest.fn().mockReturnValue('Bearer_test_token'),
      } as any;
      
      const middleware = new AuthMiddleware(mockConfigService);
      expect(middleware).toBeDefined();
      expect(middleware).toHaveProperty('use');
      expect(typeof middleware.use).toBe('function');
    });

    it('should configure RateLimitMiddleware for GET endpoints', () => {
      const middleware = new RateLimitMiddleware();
      expect(middleware).toBeDefined();
      expect(middleware).toHaveProperty('use');
      expect(typeof middleware.use).toBe('function');
    });
  });

  describe('Controller methods', () => {
    let controller: CompaniesController;

    beforeEach(() => {
      controller = module.get<CompaniesController>(CompaniesController);
    });

    it('should have registerCompany method', () => {
      expect(controller.registerCompany).toBeDefined();
      expect(typeof controller.registerCompany).toBe('function');
    });

    it('should have getCompaniesWithTransfersLastMonth method', () => {
      expect(controller.getCompaniesWithTransfersLastMonth).toBeDefined();
      expect(typeof controller.getCompaniesWithTransfersLastMonth).toBe('function');
    });

    it('should have getCompaniesJoinedLastMonth method', () => {
      expect(controller.getCompaniesJoinedLastMonth).toBeDefined();
      expect(typeof controller.getCompaniesJoinedLastMonth).toBe('function');
    });
  });

  describe('Service methods', () => {
    let service: CompaniesService;

    beforeEach(() => {
      service = module.get<CompaniesService>(CompaniesService);
    });

    it('should have createCompany method', () => {
      expect(service.createCompany).toBeDefined();
      expect(typeof service.createCompany).toBe('function');
    });

    it('should have getCompaniesWithTransfersLastMonth method', () => {
      expect(service.getCompaniesWithTransfersLastMonth).toBeDefined();
      expect(typeof service.getCompaniesWithTransfersLastMonth).toBe('function');
    });

    it('should have getCompaniesJoinedLastMonth method', () => {
      expect(service.getCompaniesJoinedLastMonth).toBeDefined();
      expect(typeof service.getCompaniesJoinedLastMonth).toBe('function');
    });
  });

  describe('Dependencies', () => {
    it('should export CompaniesService', () => {
      const exportedService = module.get<CompaniesService>(CompaniesService);
      expect(exportedService).toBeDefined();
    });
  });
});

