import { CompanySchema, Company } from '../../../src/companies/schemas/company.schema';
import { CompanyType } from '../../../src/common/types/company.types';
import mongoose from 'mongoose';

describe('CompanySchema', () => {
  let CompanyModel: mongoose.Model<Company>;

  beforeAll(() => {
    // Create model from schema for testing
    CompanyModel = mongoose.model('Company', CompanySchema);
  });

  afterAll(async () => {
    // Clean up
    mongoose.deleteModel('Company');
  });

  describe('Schema definition', () => {
    it('should be defined', () => {
      expect(CompanySchema).toBeDefined();
    });

    it('should have correct collection name', () => {
      expect(CompanySchema.get('collection')).toBe('companies');
    });

    it('should have timestamps enabled', () => {
      expect(CompanySchema.get('timestamps')).toBe(true);
    });
  });

  describe('Schema properties', () => {
    it('should have cuit field', () => {
      const cuitPath = CompanySchema.path('cuit');
      expect(cuitPath).toBeDefined();
      expect(cuitPath.isRequired).toBe(true);
    });

    it('should have businessName field', () => {
      const businessNamePath = CompanySchema.path('businessName');
      expect(businessNamePath).toBeDefined();
      expect(businessNamePath.isRequired).toBe(true);
    });

    it('should have companyType field', () => {
      const companyTypePath = CompanySchema.path('companyType');
      expect(companyTypePath).toBeDefined();
      expect(companyTypePath.isRequired).toBe(true);
    });

    it('should have adhesionDate field', () => {
      const adhesionDatePath = CompanySchema.path('adhesionDate');
      expect(adhesionDatePath).toBeDefined();
      expect(adhesionDatePath.isRequired).toBe(true);
    });

    it('should have createdAt field', () => {
      const createdAtPath = CompanySchema.path('createdAt');
      expect(createdAtPath).toBeDefined();
    });

    it('should have updatedAt field', () => {
      const updatedAtPath = CompanySchema.path('updatedAt');
      expect(updatedAtPath).toBeDefined();
    });
  });

  describe('Field types', () => {
    it('should have cuit as String type', () => {
      const cuitPath = CompanySchema.path('cuit');
      expect(cuitPath.instance).toBe('String');
    });

    it('should have businessName as String type', () => {
      const businessNamePath = CompanySchema.path('businessName');
      expect(businessNamePath.instance).toBe('String');
    });

    it('should have companyType as String type with enum', () => {
      const companyTypePath = CompanySchema.path('companyType') as any;
      expect(companyTypePath.instance).toBe('String');
      expect(companyTypePath.enumValues).toContain(CompanyType.SME);
      expect(companyTypePath.enumValues).toContain(CompanyType.CORPORATE);
    });

    it('should have adhesionDate as Date type', () => {
      const adhesionDatePath = CompanySchema.path('adhesionDate');
      expect(adhesionDatePath.instance).toBe('Date');
    });

    it('should have createdAt as Date type', () => {
      const createdAtPath = CompanySchema.path('createdAt');
      expect(createdAtPath.instance).toBe('Date');
    });

    it('should have updatedAt as Date type', () => {
      const updatedAtPath = CompanySchema.path('updatedAt');
      expect(updatedAtPath.instance).toBe('Date');
    });
  });

  describe('Indexes', () => {
    it('should have index on cuit field', () => {
      const indexes = CompanySchema.indexes();
      const cuitIndex = indexes.find((index: any) => index[0].cuit !== undefined);
      expect(cuitIndex).toBeDefined();
    });

    it('should have unique index on cuit', () => {
      const indexes = CompanySchema.indexes();
      const cuitIndex = indexes.find((index: any) => index[0].cuit !== undefined);
      expect(cuitIndex).toBeDefined();
      expect(cuitIndex[1].unique).toBe(true);
    });

    it('should have index on adhesionDate field', () => {
      const indexes = CompanySchema.indexes();
      const adhesionDateIndex = indexes.find((index: any) => index[0].adhesionDate !== undefined);
      expect(adhesionDateIndex).toBeDefined();
    });

    it('should have descending index on adhesionDate', () => {
      const indexes = CompanySchema.indexes();
      // Find the descending index specifically (there are multiple adhesionDate indexes)
      const adhesionDateDescIndex = indexes.find(
        (index: any) => index[0].adhesionDate === -1
      );
      expect(adhesionDateDescIndex).toBeDefined();
      expect(adhesionDateDescIndex[0].adhesionDate).toBe(-1);
    });

    it('should have at least 2 indexes', () => {
      const indexes = CompanySchema.indexes();
      expect(indexes.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Enum validation', () => {
    it('should accept SME as valid companyType', () => {
      const companyTypePath = CompanySchema.path('companyType') as any;
      expect(companyTypePath.enumValues).toContain(CompanyType.SME);
    });

    it('should accept Corporate as valid companyType', () => {
      const companyTypePath = CompanySchema.path('companyType') as any;
      expect(companyTypePath.enumValues).toContain(CompanyType.CORPORATE);
    });

    it('should have exactly 2 enum values for companyType', () => {
      const companyTypePath = CompanySchema.path('companyType') as any;
      expect(companyTypePath.enumValues).toHaveLength(2);
    });
  });

  describe('Required fields validation', () => {
    it('should mark cuit as required', () => {
      const cuitPath = CompanySchema.path('cuit');
      expect(cuitPath.isRequired).toBe(true);
    });

    it('should mark businessName as required', () => {
      const businessNamePath = CompanySchema.path('businessName');
      expect(businessNamePath.isRequired).toBe(true);
    });

    it('should mark companyType as required', () => {
      const companyTypePath = CompanySchema.path('companyType');
      expect(companyTypePath.isRequired).toBe(true);
    });

    it('should mark adhesionDate as required', () => {
      const adhesionDatePath = CompanySchema.path('adhesionDate');
      expect(adhesionDatePath.isRequired).toBe(true);
    });

    it('should not mark createdAt as required', () => {
      const createdAtPath = CompanySchema.path('createdAt');
      // Timestamp fields don't have isRequired property, they're auto-managed
      expect(createdAtPath.isRequired).toBeFalsy();
    });

    it('should not mark updatedAt as required', () => {
      const updatedAtPath = CompanySchema.path('updatedAt');
      // Timestamp fields don't have isRequired property, they're auto-managed
      expect(updatedAtPath.isRequired).toBeFalsy();
    });
  });

  describe('Schema validation', () => {
    it('should validate a complete company document', () => {
      const company = new CompanyModel({
        cuit: '20333444555',
        businessName: 'Test Company SA',
        companyType: CompanyType.SME,
        adhesionDate: new Date('2025-11-14'),
      });

      const validationError = company.validateSync();
      expect(validationError).toBeUndefined();
    });

    it('should fail validation without cuit', () => {
      const company = new CompanyModel({
        businessName: 'Test Company SA',
        companyType: CompanyType.SME,
        adhesionDate: new Date('2025-11-14'),
      });

      const validationError = company.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError?.errors.cuit).toBeDefined();
    });

    it('should fail validation without businessName', () => {
      const company = new CompanyModel({
        cuit: '20333444555',
        companyType: CompanyType.SME,
        adhesionDate: new Date('2025-11-14'),
      });

      const validationError = company.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError?.errors.businessName).toBeDefined();
    });

    it('should fail validation without companyType', () => {
      const company = new CompanyModel({
        cuit: '20333444555',
        businessName: 'Test Company SA',
        adhesionDate: new Date('2025-11-14'),
      });

      const validationError = company.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError?.errors.companyType).toBeDefined();
    });

    it('should fail validation without adhesionDate', () => {
      const company = new CompanyModel({
        cuit: '20333444555',
        businessName: 'Test Company SA',
        companyType: CompanyType.SME,
      });

      const validationError = company.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError?.errors.adhesionDate).toBeDefined();
    });

    it('should fail validation with invalid companyType', () => {
      const company = new CompanyModel({
        cuit: '20333444555',
        businessName: 'Test Company SA',
        companyType: 'invalid-type',
        adhesionDate: new Date('2025-11-14'),
      });

      const validationError = company.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError?.errors.companyType).toBeDefined();
    });

    it('should validate with SME company type', () => {
      const company = new CompanyModel({
        cuit: '20333444555',
        businessName: 'Test Company SA',
        companyType: CompanyType.SME,
        adhesionDate: new Date('2025-11-14'),
      });

      const validationError = company.validateSync();
      expect(validationError).toBeUndefined();
    });

    it('should validate with Corporate company type', () => {
      const company = new CompanyModel({
        cuit: '20333444555',
        businessName: 'Test Company SA',
        companyType: CompanyType.CORPORATE,
        adhesionDate: new Date('2025-11-14'),
      });

      const validationError = company.validateSync();
      expect(validationError).toBeUndefined();
    });
  });

  describe('Document creation', () => {
    it('should create a company document with all properties', () => {
      const companyData = {
        cuit: '20333444555',
        businessName: 'Test Company SA',
        companyType: CompanyType.SME,
        adhesionDate: new Date('2025-11-14'),
      };

      const company = new CompanyModel(companyData);

      expect(company.cuit).toBe(companyData.cuit);
      expect(company.businessName).toBe(companyData.businessName);
      expect(company.companyType).toBe(companyData.companyType);
      expect(company.adhesionDate).toEqual(companyData.adhesionDate);
    });

    it('should set default values for timestamps', () => {
      const company = new CompanyModel({
        cuit: '20333444555',
        businessName: 'Test Company SA',
        companyType: CompanyType.SME,
        adhesionDate: new Date('2025-11-14'),
      });

      // Timestamps are set when saving, but we can verify the fields exist
      expect(company).toHaveProperty('createdAt');
      expect(company).toHaveProperty('updatedAt');
    });
  });
});

