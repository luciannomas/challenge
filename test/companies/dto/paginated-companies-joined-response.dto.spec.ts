import { PaginatedCompaniesJoinedResponseDto } from '../../../src/companies/dto/paginated-companies-joined-response.dto';
import { CompanyJoinedResponseDto } from '../../../src/companies/dto/company-joined-response.dto';
import { CompanyType } from '../../../src/common/types/company.types';

describe('PaginatedCompaniesJoinedResponseDto', () => {
  const mockCompany1 = new CompanyJoinedResponseDto({
    id: '507f1f77bcf86cd799439011',
    cuit: '20333444555',
    businessName: 'Company 1',
    companyType: CompanyType.SME,
    adhesionDate: new Date('2025-11-14'),
  });

  const mockCompany2 = new CompanyJoinedResponseDto({
    id: '507f1f77bcf86cd799439012',
    cuit: '20444555666',
    businessName: 'Company 2',
    companyType: CompanyType.CORPORATE,
    adhesionDate: new Date('2025-11-13'),
  });

  describe('Constructor', () => {
    it('should create instance with data and meta', () => {
      const paginatedDto = new PaginatedCompaniesJoinedResponseDto({
        data: [mockCompany1, mockCompany2],
        meta: {
          total: 8,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      expect(paginatedDto.data).toHaveLength(2);
      expect(paginatedDto.data[0]).toBe(mockCompany1);
      expect(paginatedDto.data[1]).toBe(mockCompany2);
      expect(paginatedDto.meta.total).toBe(8);
      expect(paginatedDto.meta.page).toBe(1);
      expect(paginatedDto.meta.limit).toBe(10);
      expect(paginatedDto.meta.totalPages).toBe(1);
    });

    it('should create instance with empty data array', () => {
      const paginatedDto = new PaginatedCompaniesJoinedResponseDto({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      });

      expect(paginatedDto.data).toEqual([]);
      expect(paginatedDto.meta.total).toBe(0);
      expect(paginatedDto.meta.totalPages).toBe(0);
    });

    it('should handle multiple pages pagination', () => {
      const paginatedDto = new PaginatedCompaniesJoinedResponseDto({
        data: [mockCompany1],
        meta: {
          total: 25,
          page: 2,
          limit: 10,
          totalPages: 3,
        },
      });

      expect(paginatedDto.meta.total).toBe(25);
      expect(paginatedDto.meta.page).toBe(2);
      expect(paginatedDto.meta.limit).toBe(10);
      expect(paginatedDto.meta.totalPages).toBe(3);
    });

    it('should handle custom limit', () => {
      const paginatedDto = new PaginatedCompaniesJoinedResponseDto({
        data: [mockCompany1, mockCompany2],
        meta: {
          total: 20,
          page: 1,
          limit: 5,
          totalPages: 4,
        },
      });

      expect(paginatedDto.meta.limit).toBe(5);
      expect(paginatedDto.meta.totalPages).toBe(4);
    });

    it('should handle last page with fewer items', () => {
      const paginatedDto = new PaginatedCompaniesJoinedResponseDto({
        data: [mockCompany1],
        meta: {
          total: 21,
          page: 3,
          limit: 10,
          totalPages: 3,
        },
      });

      expect(paginatedDto.data).toHaveLength(1);
      expect(paginatedDto.meta.page).toBe(3);
      expect(paginatedDto.meta.total).toBe(21);
    });
  });

  describe('Meta properties', () => {
    it('should have all required meta properties', () => {
      const paginatedDto = new PaginatedCompaniesJoinedResponseDto({
        data: [mockCompany1],
        meta: {
          total: 8,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      expect(paginatedDto.meta).toHaveProperty('total');
      expect(paginatedDto.meta).toHaveProperty('page');
      expect(paginatedDto.meta).toHaveProperty('limit');
      expect(paginatedDto.meta).toHaveProperty('totalPages');
    });

    it('should have correct meta property types', () => {
      const paginatedDto = new PaginatedCompaniesJoinedResponseDto({
        data: [mockCompany1],
        meta: {
          total: 8,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      expect(typeof paginatedDto.meta.total).toBe('number');
      expect(typeof paginatedDto.meta.page).toBe('number');
      expect(typeof paginatedDto.meta.limit).toBe('number');
      expect(typeof paginatedDto.meta.totalPages).toBe('number');
    });
  });

  describe('Data array', () => {
    it('should contain CompanyJoinedResponseDto instances', () => {
      const paginatedDto = new PaginatedCompaniesJoinedResponseDto({
        data: [mockCompany1, mockCompany2],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      expect(paginatedDto.data[0]).toBeInstanceOf(CompanyJoinedResponseDto);
      expect(paginatedDto.data[1]).toBeInstanceOf(CompanyJoinedResponseDto);
    });

    it('should preserve company data properties', () => {
      const paginatedDto = new PaginatedCompaniesJoinedResponseDto({
        data: [mockCompany1],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      const company = paginatedDto.data[0];
      expect(company).toHaveProperty('id');
      expect(company).toHaveProperty('cuit');
      expect(company).toHaveProperty('businessName');
      expect(company).toHaveProperty('companyType');
      expect(company).toHaveProperty('adhesionDate');
    });
  });
});

