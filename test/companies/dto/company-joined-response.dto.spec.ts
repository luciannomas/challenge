import { CompanyJoinedResponseDto } from '../../../src/companies/dto/company-joined-response.dto';
import { CompanyType } from '../../../src/common/types/company.types';

describe('CompanyJoinedResponseDto', () => {
  describe('Constructor', () => {
    it('should create instance with all properties', () => {
      const data = {
        id: '507f1f77bcf86cd799439011',
        cuit: '20333444555',
        businessName: 'Innovatech Argentina SA',
        companyType: CompanyType.CORPORATE,
        adhesionDate: new Date('2025-10-20'),
      };

      const dto = new CompanyJoinedResponseDto(data);

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
        businessName: 'Test Company',
      };

      const dto = new CompanyJoinedResponseDto(data);

      expect(dto.id).toBe(data.id);
      expect(dto.cuit).toBe(data.cuit);
      expect(dto.businessName).toBe(data.businessName);
      expect(dto.companyType).toBeUndefined();
      expect(dto.adhesionDate).toBeUndefined();
    });

    it('should only include expected properties when filtering', () => {
      const data: any = {
        id: '507f1f77bcf86cd799439011',
        cuit: '20333444555',
        businessName: 'Test Company SA',
        companyType: CompanyType.SME,
        adhesionDate: new Date('2025-11-14'),
      };

      const dto = new CompanyJoinedResponseDto(data);

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
});

