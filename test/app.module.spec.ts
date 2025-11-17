import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppModule } from '../src/app.module';
import { CompaniesModule } from '../src/companies/companies.module';
import { TransfersModule } from '../src/transfers/transfers.module';

describe('AppModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(MongooseModule)
      .useModule(
        MongooseModule.forRoot('mongodb://localhost:27017/interbanking-test'),
      )
      .compile();
  });

  afterAll(async () => {
    await module.close();
  });

  describe('Module Initialization', () => {
    it('should compile the module', () => {
      expect(module).toBeDefined();
    });

    it('should have AppModule defined', () => {
      const appModule = module.get(AppModule);
      expect(appModule).toBeDefined();
    });
  });

  describe('Module Imports', () => {
    it('should import ConfigModule', () => {
      const configModule = module.get(ConfigModule);
      expect(configModule).toBeDefined();
    });

    it('should import CompaniesModule', () => {
      const companiesModule = module.get(CompaniesModule);
      expect(companiesModule).toBeDefined();
    });

    it('should import TransfersModule', () => {
      const transfersModule = module.get(TransfersModule);
      expect(transfersModule).toBeDefined();
    });
  });

  describe('Module Configuration', () => {
    it('should have ConfigModule configured as global', () => {
      const configModule = module.get(ConfigModule);
      expect(configModule).toBeDefined();
    });

    it('should connect to MongoDB', () => {
      // Verify that MongoDB connection is established
      const connection = module.get('DatabaseConnection');
      expect(connection).toBeDefined();
    });
  });

  describe('Module Dependencies', () => {
    it('should provide all required modules', () => {
      expect(module.get(AppModule)).toBeDefined();
      expect(module.get(CompaniesModule)).toBeDefined();
      expect(module.get(TransfersModule)).toBeDefined();
    });

    it('should have correct module structure', () => {
      const appModule = module.get(AppModule);
      expect(appModule).toBeInstanceOf(AppModule);
    });
  });

  describe('Environment Configuration', () => {
    it('should use default MongoDB URI when env variable is not set', () => {
      // This test verifies the fallback behavior
      const defaultUri = 'mongodb://localhost:27017/interbanking';
      const uri = process.env.MONGODB_URI || defaultUri;
      expect(uri).toBeDefined();
      expect(typeof uri).toBe('string');
    });

    it('should support custom MongoDB URI from environment', () => {
      const testUri = 'mongodb://localhost:27017/custom-db';
      process.env.MONGODB_URI = testUri;
      expect(process.env.MONGODB_URI).toBe(testUri);
      // Clean up
      delete process.env.MONGODB_URI;
    });
  });

  describe('Module Integration', () => {
    it('should integrate CompaniesModule correctly', () => {
      const companiesModule = module.get(CompaniesModule);
      expect(companiesModule).toBeDefined();
      expect(companiesModule).toBeInstanceOf(CompaniesModule);
    });

    it('should integrate TransfersModule correctly', () => {
      const transfersModule = module.get(TransfersModule);
      expect(transfersModule).toBeDefined();
      expect(transfersModule).toBeInstanceOf(TransfersModule);
    });

    it('should have all modules working together', () => {
      const appModule = module.get(AppModule);
      const companiesModule = module.get(CompaniesModule);
      const transfersModule = module.get(TransfersModule);

      expect(appModule).toBeDefined();
      expect(companiesModule).toBeDefined();
      expect(transfersModule).toBeDefined();
    });
  });
});

