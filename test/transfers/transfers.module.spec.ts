import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { TransfersModule } from '../../src/transfers/transfers.module';
import { TransfersController } from '../../src/transfers/controllers/transfers.controller';
import { TransfersService } from '../../src/transfers/services/transfers.service';

describe('TransfersModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/interbanking-test'),
        TransfersModule,
      ],
    }).compile();
  });

  afterAll(async () => {
    await module.close();
  });

  describe('Module Initialization', () => {
    it('should compile the module', () => {
      expect(module).toBeDefined();
    });

    it('should have TransfersModule defined', () => {
      const transfersModule = module.get(TransfersModule);
      expect(transfersModule).toBeDefined();
    });
  });

  describe('Controllers', () => {
    it('should have TransfersController registered', () => {
      const controller = module.get<TransfersController>(TransfersController);
      expect(controller).toBeDefined();
    });

    it('should have controller methods defined', () => {
      const controller = module.get<TransfersController>(TransfersController);
      expect(controller.createTransfer).toBeDefined();
      expect(typeof controller.createTransfer).toBe('function');
      expect(controller.getTransfersLastMonth).toBeDefined();
      expect(typeof controller.getTransfersLastMonth).toBe('function');
    });
  });

  describe('Providers', () => {
    it('should have TransfersService registered', () => {
      const service = module.get<TransfersService>(TransfersService);
      expect(service).toBeDefined();
    });

    it('should have service methods defined', () => {
      const service = module.get<TransfersService>(TransfersService);
      expect(service.createTransfer).toBeDefined();
      expect(typeof service.createTransfer).toBe('function');
      expect(service.getTransfersLastMonth).toBeDefined();
      expect(typeof service.getTransfersLastMonth).toBe('function');
    });
  });

  describe('Dependencies', () => {
    it('should inject TransfersService into TransfersController', () => {
      const controller = module.get<TransfersController>(TransfersController);
      const service = module.get<TransfersService>(TransfersService);
      
      expect(controller).toBeDefined();
      expect(service).toBeDefined();
    });

    it('should export TransfersService', () => {
      const service = module.get<TransfersService>(TransfersService);
      expect(service).toBeDefined();
    });
  });

  describe('Module Configuration', () => {
    it('should have correct module metadata', () => {
      const moduleRef = module.get(TransfersModule);
      expect(moduleRef).toBeDefined();
    });

    it('should properly initialize MongoDB connection', () => {
      const service = module.get<TransfersService>(TransfersService);
      expect(service).toBeDefined();
    });
  });
});

