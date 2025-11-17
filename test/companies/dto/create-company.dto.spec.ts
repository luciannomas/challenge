import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateCompanyDto } from '../../../src/companies/dto/create-company.dto';
import { CompanyType } from '../../../src/common/types/company.types';

describe('CreateCompanyDto', () => {
  describe('Validation', () => {
    describe('cuit', () => {
      it('should pass with valid 11-digit CUIT', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '20333444555',
          businessName: 'Test Company SA',
          companyType: CompanyType.SME,
          adhesionDate: '2025-11-14',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should fail with CUIT shorter than 11 digits', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '123456',
          businessName: 'Test Company SA',
          companyType: CompanyType.SME,
          adhesionDate: '2025-11-14',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('cuit');
        expect(JSON.stringify(errors[0].constraints)).toContain('CUIT must be 11 digits');
      });

      it('should fail with CUIT longer than 11 digits', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '203334445556789',
          businessName: 'Test Company SA',
          companyType: CompanyType.SME,
          adhesionDate: '2025-11-14',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('cuit');
      });

      it('should fail with non-numeric CUIT', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '2033344455A',
          businessName: 'Test Company SA',
          companyType: CompanyType.SME,
          adhesionDate: '2025-11-14',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('cuit');
      });

      it('should fail when cuit is empty', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '',
          businessName: 'Test Company SA',
          companyType: CompanyType.SME,
          adhesionDate: '2025-11-14',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('cuit');
      });
    });

    describe('businessName', () => {
      it('should pass with valid businessName (3-100 characters)', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '20333444555',
          businessName: 'Test Company SA',
          companyType: CompanyType.SME,
          adhesionDate: '2025-11-14',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should fail with businessName shorter than 3 characters', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '20333444555',
          businessName: 'AB',
          companyType: CompanyType.SME,
          adhesionDate: '2025-11-14',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('businessName');
        expect(JSON.stringify(errors[0].constraints)).toContain('Business name must be at least 3 characters long');
      });

      it('should fail with businessName longer than 100 characters', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '20333444555',
          businessName: 'A'.repeat(101),
          companyType: CompanyType.SME,
          adhesionDate: '2025-11-14',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('businessName');
        expect(JSON.stringify(errors[0].constraints)).toContain('Business name must not exceed 100 characters');
      });

      it('should fail when businessName is empty', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '20333444555',
          businessName: '',
          companyType: CompanyType.SME,
          adhesionDate: '2025-11-14',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('businessName');
      });

      it('should pass with businessName exactly 3 characters', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '20333444555',
          businessName: 'ABC',
          companyType: CompanyType.SME,
          adhesionDate: '2025-11-14',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should pass with businessName exactly 100 characters', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '20333444555',
          businessName: 'A'.repeat(100),
          companyType: CompanyType.SME,
          adhesionDate: '2025-11-14',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });
    });

    describe('companyType', () => {
      it('should pass with SME company type', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '20333444555',
          businessName: 'Test Company SA',
          companyType: CompanyType.SME,
          adhesionDate: '2025-11-14',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should pass with Corporate company type', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '20333444555',
          businessName: 'Test Company SA',
          companyType: CompanyType.CORPORATE,
          adhesionDate: '2025-11-14',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should fail with invalid company type', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '20333444555',
          businessName: 'Test Company SA',
          companyType: 'invalid-type' as any,
          adhesionDate: '2025-11-14',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('companyType');
      });

      it('should fail when companyType is empty', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '20333444555',
          businessName: 'Test Company SA',
          companyType: '' as any,
          adhesionDate: '2025-11-14',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('companyType');
      });
    });

    describe('adhesionDate', () => {
      it('should pass with valid date format YYYY-MM-DD', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '20333444555',
          businessName: 'Test Company SA',
          companyType: CompanyType.SME,
          adhesionDate: '2025-11-14',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should fail with date format DD-MM-YYYY', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '20333444555',
          businessName: 'Test Company SA',
          companyType: CompanyType.SME,
          adhesionDate: '14-11-2025',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('adhesionDate');
        expect(JSON.stringify(errors[0].constraints)).toContain('Adhesion date must be in format YYYY-MM-DD');
      });

      it('should fail with date format MM/DD/YYYY', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '20333444555',
          businessName: 'Test Company SA',
          companyType: CompanyType.SME,
          adhesionDate: '11/14/2025',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('adhesionDate');
      });

      it('should fail with invalid date format', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '20333444555',
          businessName: 'Test Company SA',
          companyType: CompanyType.SME,
          adhesionDate: 'invalid-date',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('adhesionDate');
      });

      it('should fail when adhesionDate is empty', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '20333444555',
          businessName: 'Test Company SA',
          companyType: CompanyType.SME,
          adhesionDate: '',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('adhesionDate');
      });

      it('should pass with past date', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '20333444555',
          businessName: 'Test Company SA',
          companyType: CompanyType.SME,
          adhesionDate: '2020-01-01',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should pass with future date', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '20333444555',
          businessName: 'Test Company SA',
          companyType: CompanyType.SME,
          adhesionDate: '2030-12-31',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });
    });

    describe('Multiple field validation', () => {
      it('should fail with multiple invalid fields', async () => {
        const dto = plainToInstance(CreateCompanyDto, {
          cuit: '123',
          businessName: 'AB',
          companyType: 'invalid',
          adhesionDate: 'invalid',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(4); // All 4 fields should fail
      });

      it('should fail when all fields are missing', async () => {
        const dto = plainToInstance(CreateCompanyDto, {});

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });
});

