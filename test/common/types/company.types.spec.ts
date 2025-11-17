import { CompanyType, CompanyStatus } from '../../../src/common/types/company.types';

describe('Company Types', () => {
  describe('CompanyType Enum', () => {
    it('should have SME value', () => {
      expect(CompanyType.SME).toBeDefined();
      expect(CompanyType.SME).toBe('sme');
    });

    it('should have CORPORATE value', () => {
      expect(CompanyType.CORPORATE).toBeDefined();
      expect(CompanyType.CORPORATE).toBe('corporate');
    });

    it('should have exactly 2 values', () => {
      const values = Object.values(CompanyType);
      expect(values).toHaveLength(2);
    });

    it('should contain all expected values', () => {
      const values = Object.values(CompanyType);
      expect(values).toContain('sme');
      expect(values).toContain('corporate');
    });

    it('should be accessible by key', () => {
      expect(CompanyType['SME']).toBe('sme');
      expect(CompanyType['CORPORATE']).toBe('corporate');
    });

    it('should be a string enum', () => {
      expect(typeof CompanyType.SME).toBe('string');
      expect(typeof CompanyType.CORPORATE).toBe('string');
    });
  });

  describe('CompanyStatus Enum', () => {
    it('should have ACTIVE value', () => {
      expect(CompanyStatus.ACTIVE).toBeDefined();
      expect(CompanyStatus.ACTIVE).toBe('active');
    });

    it('should have INACTIVE value', () => {
      expect(CompanyStatus.INACTIVE).toBeDefined();
      expect(CompanyStatus.INACTIVE).toBe('inactive');
    });

    it('should have PENDING value', () => {
      expect(CompanyStatus.PENDING).toBeDefined();
      expect(CompanyStatus.PENDING).toBe('pending');
    });

    it('should have exactly 3 values', () => {
      const values = Object.values(CompanyStatus);
      expect(values).toHaveLength(3);
    });

    it('should contain all expected values', () => {
      const values = Object.values(CompanyStatus);
      expect(values).toContain('active');
      expect(values).toContain('inactive');
      expect(values).toContain('pending');
    });

    it('should be accessible by key', () => {
      expect(CompanyStatus['ACTIVE']).toBe('active');
      expect(CompanyStatus['INACTIVE']).toBe('inactive');
      expect(CompanyStatus['PENDING']).toBe('pending');
    });

    it('should be a string enum', () => {
      expect(typeof CompanyStatus.ACTIVE).toBe('string');
      expect(typeof CompanyStatus.INACTIVE).toBe('string');
      expect(typeof CompanyStatus.PENDING).toBe('string');
    });
  });

  describe('Enum Usage', () => {
    it('should allow CompanyType in type annotations', () => {
      const type: CompanyType = CompanyType.SME;
      expect(type).toBe('sme');
    });

    it('should allow CompanyStatus in type annotations', () => {
      const status: CompanyStatus = CompanyStatus.ACTIVE;
      expect(status).toBe('active');
    });

    it('should allow comparison with string values', () => {
      expect(CompanyType.SME === 'sme').toBe(true);
      expect(CompanyType.CORPORATE === 'corporate').toBe(true);
    });

    it('should allow use in switch statements', () => {
      const getTypeDescription = (type: CompanyType): string => {
        switch (type) {
          case CompanyType.SME:
            return 'Small and Medium Enterprise';
          case CompanyType.CORPORATE:
            return 'Corporate';
          default:
            return 'Unknown';
        }
      };

      expect(getTypeDescription(CompanyType.SME)).toBe('Small and Medium Enterprise');
      expect(getTypeDescription(CompanyType.CORPORATE)).toBe('Corporate');
    });

    it('should allow use in objects', () => {
      const company = {
        name: 'Test Company',
        type: CompanyType.SME,
        status: CompanyStatus.ACTIVE,
      };

      expect(company.type).toBe('sme');
      expect(company.status).toBe('active');
    });
  });
});

