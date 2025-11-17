import { ICompany } from '../../../src/common/interfaces/company.interface';
import { CompanyType } from '../../../src/common/types/company.types';

describe('ICompany Interface', () => {
  describe('Interface Structure', () => {
    it('should create object with all required properties', () => {
      const company: ICompany = {
        cuit: '20333444555',
        businessName: 'Test Company SA',
        companyType: CompanyType.SME,
        adhesionDate: new Date('2025-11-14'),
        createdAt: new Date('2025-11-14T00:00:00.000Z'),
        updatedAt: new Date('2025-11-14T00:00:00.000Z'),
      };

      expect(company).toBeDefined();
      expect(company.cuit).toBe('20333444555');
      expect(company.businessName).toBe('Test Company SA');
      expect(company.companyType).toBe(CompanyType.SME);
      expect(company.adhesionDate).toBeInstanceOf(Date);
      expect(company.createdAt).toBeInstanceOf(Date);
      expect(company.updatedAt).toBeInstanceOf(Date);
    });

    it('should accept SME company type', () => {
      const company: ICompany = {
        cuit: '20333444555',
        businessName: 'SME Company',
        companyType: CompanyType.SME,
        adhesionDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(company.companyType).toBe(CompanyType.SME);
    });

    it('should accept CORPORATE company type', () => {
      const company: ICompany = {
        cuit: '20333444555',
        businessName: 'Corporate Company',
        companyType: CompanyType.CORPORATE,
        adhesionDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(company.companyType).toBe(CompanyType.CORPORATE);
    });
  });

  describe('Property Types', () => {
    it('should have cuit as string', () => {
      const company: ICompany = {
        cuit: '20333444555',
        businessName: 'Test Company',
        companyType: CompanyType.SME,
        adhesionDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(typeof company.cuit).toBe('string');
    });

    it('should have businessName as string', () => {
      const company: ICompany = {
        cuit: '20333444555',
        businessName: 'Test Company SA',
        companyType: CompanyType.SME,
        adhesionDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(typeof company.businessName).toBe('string');
    });

    it('should have companyType as CompanyType enum', () => {
      const company: ICompany = {
        cuit: '20333444555',
        businessName: 'Test Company',
        companyType: CompanyType.SME,
        adhesionDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(company.companyType).toBe(CompanyType.SME);
      expect(Object.values(CompanyType)).toContain(company.companyType);
    });

    it('should have adhesionDate as Date', () => {
      const company: ICompany = {
        cuit: '20333444555',
        businessName: 'Test Company',
        companyType: CompanyType.SME,
        adhesionDate: new Date('2025-11-14'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(company.adhesionDate).toBeInstanceOf(Date);
    });

    it('should have createdAt as Date', () => {
      const company: ICompany = {
        cuit: '20333444555',
        businessName: 'Test Company',
        companyType: CompanyType.SME,
        adhesionDate: new Date(),
        createdAt: new Date('2025-11-14T00:00:00.000Z'),
        updatedAt: new Date(),
      };

      expect(company.createdAt).toBeInstanceOf(Date);
    });

    it('should have updatedAt as Date', () => {
      const company: ICompany = {
        cuit: '20333444555',
        businessName: 'Test Company',
        companyType: CompanyType.SME,
        adhesionDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date('2025-11-14T12:00:00.000Z'),
      };

      expect(company.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Interface Usage', () => {
    it('should work in functions', () => {
      const getCompanyInfo = (company: ICompany): string => {
        return `${company.businessName} - ${company.cuit}`;
      };

      const company: ICompany = {
        cuit: '20333444555',
        businessName: 'Test Company SA',
        companyType: CompanyType.SME,
        adhesionDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(getCompanyInfo(company)).toBe('Test Company SA - 20333444555');
    });

    it('should work in arrays', () => {
      const companies: ICompany[] = [
        {
          cuit: '20111111111',
          businessName: 'Company 1',
          companyType: CompanyType.SME,
          adhesionDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          cuit: '20222222222',
          businessName: 'Company 2',
          companyType: CompanyType.CORPORATE,
          adhesionDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      expect(companies).toHaveLength(2);
      expect(companies[0].companyType).toBe(CompanyType.SME);
      expect(companies[1].companyType).toBe(CompanyType.CORPORATE);
    });

    it('should allow partial updates', () => {
      const updateCompany = (company: ICompany, updates: Partial<ICompany>): ICompany => {
        return { ...company, ...updates };
      };

      const company: ICompany = {
        cuit: '20333444555',
        businessName: 'Old Name',
        companyType: CompanyType.SME,
        adhesionDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updated = updateCompany(company, { businessName: 'New Name' });
      expect(updated.businessName).toBe('New Name');
      expect(updated.cuit).toBe('20333444555');
    });
  });
});

