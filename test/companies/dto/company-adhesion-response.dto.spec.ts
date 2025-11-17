import { CompanyAdhesionResponseDto } from '../../../src/companies/dto/company-adhesion-response.dto';
import { CompanyType } from '../../../src/common/types/company.types';

describe('CompanyAdhesionResponseDto', () => {
  describe('Constructor', () => {
    it('should create instance with all properties', () => {
      const data = {
        id: '507f1f77bcf86cd799439011',
        cuit: '20333444555',
        businessName: 'Test Company SA',
        companyType: CompanyType.SME,
        adhesionDate: new Date('2025-11-14'),
      };

      const dto = new CompanyAdhesionResponseDto(data);

      expect(dto.id).toBe(data.id);
      expect(dto.cuit).toBe(data.cuit);
      expect(dto.businessName).toBe(data.businessName);
      expect(dto.companyType).toBe(data.companyType);
      expect(dto.adhesionDate).toBe(data.adhesionDate);
    });

    it('should create instance with partial properties', () => {
      const data = {
        id: '507f1f77bcf86cd799439011',
        cuit: '20333444555',
      };

      const dto = new CompanyAdhesionResponseDto(data);

      expect(dto.id).toBe(data.id);
      expect(dto.cuit).toBe(data.cuit);
      expect(dto.businessName).toBeUndefined();
      expect(dto.companyType).toBeUndefined();
      expect(dto.adhesionDate).toBeUndefined();
    });

    it('should create instance with empty object', () => {
      const dto = new CompanyAdhesionResponseDto({});

      expect(dto.id).toBeUndefined();
      expect(dto.cuit).toBeUndefined();
      expect(dto.businessName).toBeUndefined();
      expect(dto.companyType).toBeUndefined();
      expect(dto.adhesionDate).toBeUndefined();
    });

    it('should handle SME company type', () => {
      const data = {
        id: '507f1f77bcf86cd799439011',
        cuit: '20333444555',
        businessName: 'Test SME',
        companyType: CompanyType.SME,
        adhesionDate: new Date('2025-11-14'),
      };

      const dto = new CompanyAdhesionResponseDto(data);

      expect(dto.companyType).toBe(CompanyType.SME);
    });

    it('should handle Corporate company type', () => {
      const data = {
        id: '507f1f77bcf86cd799439011',
        cuit: '20333444555',
        businessName: 'Test Corporate',
        companyType: CompanyType.CORPORATE,
        adhesionDate: new Date('2025-11-14'),
      };

      const dto = new CompanyAdhesionResponseDto(data);

      expect(dto.companyType).toBe(CompanyType.CORPORATE);
    });

    it('should only include expected properties when filtering', () => {
      const data: any = {
        id: '507f1f77bcf86cd799439011',
        cuit: '20333444555',
        businessName: 'Test Company SA',
        companyType: CompanyType.SME,
        adhesionDate: new Date('2025-11-14'),
      };

      const dto = new CompanyAdhesionResponseDto(data);

      // Verify expected properties exist
      expect(dto).toHaveProperty('id');
      expect(dto).toHaveProperty('cuit');
      expect(dto).toHaveProperty('businessName');
      expect(dto).toHaveProperty('companyType');
      expect(dto).toHaveProperty('adhesionDate');
      
      // Verify only 5 properties are present
      expect(Object.keys(dto).length).toBe(5);
    });
  });

  describe('Properties', () => {
    it('should have correct property types', () => {
      const dto = new CompanyAdhesionResponseDto({
        id: '507f1f77bcf86cd799439011',
        cuit: '20333444555',
        businessName: 'Test Company SA',
        companyType: CompanyType.SME,
        adhesionDate: new Date('2025-11-14'),
      });

      expect(typeof dto.id).toBe('string');
      expect(typeof dto.cuit).toBe('string');
      expect(typeof dto.businessName).toBe('string');
      expect(typeof dto.companyType).toBe('string');
      expect(dto.adhesionDate).toBeInstanceOf(Date);
    });
  });
});

