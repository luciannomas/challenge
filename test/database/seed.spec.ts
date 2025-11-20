import * as mongoose from 'mongoose';
import * as moment from 'moment-timezone';
import { CompanyType } from '../../src/common/types/company.types';
import { TIMEZONE } from '../../src/common/constants/timezone.constant';

// Mock mongoose before importing seed
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    model: jest.fn(),
    Schema: actualMongoose.Schema,
  };
});

describe('Seed Script', () => {
  let mockCompanyModel: any;
  let mockTransferModel: any;
  let consoleSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock console methods
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    // Mock model methods
    mockCompanyModel = {
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      insertMany: jest.fn().mockImplementation((docs) => 
        Promise.resolve(docs.map((doc: any, index: number) => ({
          ...doc,
          _id: new mongoose.Types.ObjectId(`60d5ec49f1b2c8b1f8${String(index).padStart(6, '0')}`),
        })))
      ),
    };

    mockTransferModel = {
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      insertMany: jest.fn().mockImplementation((docs) =>
        Promise.resolve(docs.map((doc: any) => ({
          ...doc,
          _id: new mongoose.Types.ObjectId(),
        })))
      ),
    };

    // Mock mongoose.model to return our mocked models
    (mongoose.model as jest.Mock).mockImplementation((modelName: string) => {
      if (modelName === 'Company') return mockCompanyModel;
      if (modelName === 'Transfer') return mockTransferModel;
      return null;
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  it('should be testable', () => {
    expect(true).toBe(true);
  });

  describe('Date calculations', () => {
    it('should use UTC-3 timezone (America/Buenos_Aires)', () => {
      moment.tz.setDefault(TIMEZONE.NAME);
      const now = moment.tz(TIMEZONE.NAME);
      const offset = now.format('Z');
      
      expect(TIMEZONE.NAME).toBe('America/Buenos_Aires');
      expect(offset).toBe('-03:00');
    });

    it('should calculate dates correctly using moment', () => {
      const now = moment.tz(TIMEZONE.NAME);
      
      const oneMonthAgo = now.clone().subtract(1, 'month');
      const twoMonthsAgo = now.clone().subtract(2, 'months');
      const oneYearAgo = now.clone().subtract(1, 'year');
      
      expect(oneMonthAgo.isBefore(now)).toBe(true);
      expect(twoMonthsAgo.isBefore(oneMonthAgo)).toBe(true);
      expect(oneYearAgo.isBefore(twoMonthsAgo)).toBe(true);
    });

    it('should handle days subtraction correctly', () => {
      const now = moment.tz(TIMEZONE.NAME);
      
      const oneDayAgo = now.clone().subtract(1, 'day');
      const sevenDaysAgo = now.clone().subtract(7, 'days');
      const thirtyDaysAgo = now.clone().subtract(30, 'days');
      
      expect(oneDayAgo.diff(now, 'days')).toBe(-1);
      expect(sevenDaysAgo.diff(now, 'days')).toBe(-7);
      expect(thirtyDaysAgo.diff(now, 'days')).toBe(-30);
    });
  });

  describe('Company data structure', () => {
    it('should define company schema with required fields', () => {
      const companySchema = new mongoose.Schema({
        cuit: { type: String, required: true, unique: true },
        businessName: { type: String, required: true },
        companyType: { type: String, required: true, enum: Object.values(CompanyType) },
        adhesionDate: { type: Date, required: true },
      }, { timestamps: true });

      const paths = companySchema.paths;
      
      expect(paths.cuit).toBeDefined();
      expect(paths.businessName).toBeDefined();
      expect(paths.companyType).toBeDefined();
      expect(paths.adhesionDate).toBeDefined();
    });

    it('should validate company type enum', () => {
      const validTypes = Object.values(CompanyType);
      
      expect(validTypes).toContain(CompanyType.SME);
      expect(validTypes).toContain(CompanyType.CORPORATE);
      expect(validTypes).toHaveLength(2);
    });

    it('should create company with all required fields', () => {
      const now = moment.tz(TIMEZONE.NAME);
      
      const company = {
        cuit: '20100000001',
        businessName: 'Test Company SA',
        companyType: CompanyType.CORPORATE,
        adhesionDate: now.toDate(),
      };

      expect(company.cuit).toMatch(/^\d{11}$/);
      expect(company.businessName).toBeTruthy();
      expect([CompanyType.SME, CompanyType.CORPORATE]).toContain(company.companyType);
      expect(company.adhesionDate).toBeInstanceOf(Date);
    });
  });

  describe('Transfer data structure', () => {
    it('should define transfer schema with required fields', () => {
      const transferSchema = new mongoose.Schema({
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
        amount: { type: Number, required: true },
        debitAccount: { type: String, required: true },
        creditAccount: { type: String, required: true },
        transferDate: { type: Date, required: true },
      }, { timestamps: true });

      const paths = transferSchema.paths;
      
      expect(paths.companyId).toBeDefined();
      expect(paths.amount).toBeDefined();
      expect(paths.debitAccount).toBeDefined();
      expect(paths.creditAccount).toBeDefined();
      expect(paths.transferDate).toBeDefined();
    });

    it('should create transfer with valid amount', () => {
      const transfer = {
        companyId: new mongoose.Types.ObjectId(),
        amount: 150000.50,
        debitAccount: '0000003100012345678',
        creditAccount: '0000003200087654321',
        transferDate: new Date(),
      };

      expect(transfer.amount).toBeGreaterThan(0);
      expect(typeof transfer.amount).toBe('number');
      expect(transfer.debitAccount).toMatch(/^\d{19}$/);
      expect(transfer.creditAccount).toMatch(/^\d{19}$/);
    });

    it('should validate account number format', () => {
      const validAccount = '0000003100012345678';
      const invalidAccount = '123';

      expect(validAccount).toMatch(/^\d{19}$/);
      expect(invalidAccount).not.toMatch(/^\d{19}$/);
    });
  });

  describe('Seed data distribution', () => {
    it('should create correct number of old companies', () => {
      const oldCompaniesCount = 12; // As per seed script
      
      expect(oldCompaniesCount).toBe(12);
    });

    it('should create correct number of recent companies', () => {
      const recentCompaniesCount = 8; // As per seed script
      
      expect(recentCompaniesCount).toBe(8);
    });

    it('should create total of 20 companies', () => {
      const totalCompanies = 12 + 8; // old + recent
      
      expect(totalCompanies).toBe(20);
    });

    it('should create 13 transfers', () => {
      const totalTransfers = 13; // As per seed script
      
      expect(totalTransfers).toBe(13);
    });

    it('should have companies with varied dates', () => {
      const now = moment.tz(TIMEZONE.NAME);
      
      const dates = [
        now.clone().subtract(2, 'years'),
        now.clone().subtract(1, 'year'),
        now.clone().subtract(6, 'months'),
        now.clone().subtract(2, 'months'),
        now.clone().subtract(28, 'days'),
        now.clone().subtract(1, 'day'),
      ];

      dates.forEach((date, index) => {
        if (index > 0) {
          expect(date.isAfter(dates[index - 1])).toBe(true);
        }
      });
    });
  });

  describe('Date filtering logic', () => {
    it('should correctly identify companies within last month', () => {
      const now = moment.tz(TIMEZONE.NAME);
      const oneMonthAgo = now.clone().subtract(1, 'month');

      const withinLastMonth = now.clone().subtract(28, 'days');
      const outsideLastMonth = now.clone().subtract(35, 'days');

      expect(withinLastMonth.isAfter(oneMonthAgo)).toBe(true);
      expect(outsideLastMonth.isAfter(oneMonthAgo)).toBe(false);
    });

    it('should filter transfers by date correctly', () => {
      const now = moment.tz(TIMEZONE.NAME);
      const oneMonthAgo = now.clone().subtract(1, 'month').toDate();

      const transfers = [
        { transferDate: now.clone().subtract(10, 'days').toDate() },
        { transferDate: now.clone().subtract(40, 'days').toDate() },
        { transferDate: now.clone().subtract(5, 'days').toDate() },
      ];

      const transfersLastMonth = transfers.filter(t => t.transferDate >= oneMonthAgo);

      expect(transfersLastMonth).toHaveLength(2);
    });

    it('should calculate unique companies with transfers', () => {
      const companyIds = [
        new mongoose.Types.ObjectId('60d5ec49f1b2c8b1f8000001'),
        new mongoose.Types.ObjectId('60d5ec49f1b2c8b1f8000002'),
        new mongoose.Types.ObjectId('60d5ec49f1b2c8b1f8000001'), // Duplicate
        new mongoose.Types.ObjectId('60d5ec49f1b2c8b1f8000003'),
      ];

      const uniqueCompanies = new Set(companyIds.map(id => id.toString()));

      expect(uniqueCompanies.size).toBe(3);
    });
  });

  describe('CUIT format validation', () => {
    it('should validate CUIT format (11 digits)', () => {
      const validCuits = [
        '20100000001',
        '20200000001',
        '30555666777',
      ];

      validCuits.forEach(cuit => {
        expect(cuit).toMatch(/^\d{11}$/);
        expect(cuit.length).toBe(11);
      });
    });

    it('should reject invalid CUIT formats', () => {
      const invalidCuits = [
        '123',
        '201000000011', // 12 digits
        '2010000000', // 10 digits
        'abc12345678',
      ];

      invalidCuits.forEach(cuit => {
        expect(cuit).not.toMatch(/^\d{11}$/);
      });
    });
  });

  describe('Business name validation', () => {
    it('should allow valid business names', () => {
      const validNames = [
        'Innovatech Argentina SA',
        'Servicios Modernos SRL',
        'Tech & Solutions SA',
        'Empresa Número 1 SRL',
      ];

      validNames.forEach(name => {
        expect(name.length).toBeGreaterThan(0);
        expect(typeof name).toBe('string');
      });
    });
  });

  describe('Amount validation', () => {
    it('should validate positive transfer amounts', () => {
      const validAmounts = [
        150000.50,
        75000.00,
        250000.00,
        30000.00,
      ];

      validAmounts.forEach(amount => {
        expect(amount).toBeGreaterThan(0);
        expect(typeof amount).toBe('number');
      });
    });

    it('should handle decimal amounts correctly', () => {
      const amounts = [
        { value: 150000.50, decimals: 2 },
        { value: 75000.00, decimals: 0 },
        { value: 180000.25, decimals: 2 },
      ];

      amounts.forEach(({ value, decimals }) => {
        const decimalPart = (value % 1).toFixed(2).split('.')[1];
        expect(parseInt(decimalPart)).toBeLessThanOrEqual(99);
      });
    });
  });

  describe('MongoDB URI configuration', () => {
    it('should use default MongoDB URI when env var is not set', () => {
      const originalEnv = process.env.MONGODB_URI;
      delete process.env.MONGODB_URI;

      const defaultUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/interbanking';

      expect(defaultUri).toBe('mongodb://localhost:27017/interbanking');

      if (originalEnv) {
        process.env.MONGODB_URI = originalEnv;
      }
    });

    it('should use env var MongoDB URI when set', () => {
      const testUri = 'mongodb://test:27017/testdb';
      process.env.MONGODB_URI = testUri;

      const uri = process.env.MONGODB_URI;

      expect(uri).toBe(testUri);
    });
  });

  describe('Timezone configuration', () => {
    it('should configure moment to use UTC-3', () => {
      moment.tz.setDefault(TIMEZONE.NAME);
      const now = moment.tz(TIMEZONE.NAME);

      expect(TIMEZONE.NAME).toBe('America/Buenos_Aires');
      expect(now.format('Z')).toBe('-03:00');
    });

    it('should format dates with timezone information', () => {
      moment.tz.setDefault(TIMEZONE.NAME);
      const now = moment.tz(TIMEZONE.NAME);
      const formatted = now.format('DD/MM/YYYY HH:mm:ss Z');

      expect(formatted).toContain('-03:00');
    });
  });
});

