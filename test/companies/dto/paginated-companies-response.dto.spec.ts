import { PaginatedCompaniesResponseDto } from '../../../src/companies/dto/paginated-companies-response.dto';
import { CompanyResponseDto } from '../../../src/companies/dto/company-response.dto';
import { CompanyType } from '../../../src/common/types/company.types';

describe('PaginatedCompaniesResponseDto', () => {
  it('should be defined', () => {
    expect(PaginatedCompaniesResponseDto).toBeDefined();
  });

  it('should create instance with data and meta', () => {
    const mockCompany = new CompanyResponseDto({
      id: 'test-id',
      cuit: '20333444555',
      businessName: 'Test Company',
      companyType: CompanyType.SME,
      adhesionDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const dto = new PaginatedCompaniesResponseDto({
      data: [mockCompany],
      meta: {
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10,
      },
    });

    expect(dto.data).toEqual([mockCompany]);
    expect(dto.meta.total).toBe(100);
    expect(dto.meta.page).toBe(1);
    expect(dto.meta.limit).toBe(10);
    expect(dto.meta.totalPages).toBe(10);
  });

  it('should handle empty data array', () => {
    const dto = new PaginatedCompaniesResponseDto({
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    });

    expect(dto.data).toEqual([]);
    expect(dto.data).toHaveLength(0);
    expect(dto.meta.total).toBe(0);
    expect(dto.meta.totalPages).toBe(0);
  });

  it('should handle multiple companies in data', () => {
    const mockCompanies = [
      new CompanyResponseDto({
        id: 'id-1',
        cuit: '20111222333',
        businessName: 'Company 1',
        companyType: CompanyType.SME,
      }),
      new CompanyResponseDto({
        id: 'id-2',
        cuit: '20444555666',
        businessName: 'Company 2',
        companyType: CompanyType.CORPORATE,
      }),
      new CompanyResponseDto({
        id: 'id-3',
        cuit: '20777888999',
        businessName: 'Company 3',
        companyType: CompanyType.SME,
      }),
    ];

    const dto = new PaginatedCompaniesResponseDto({
      data: mockCompanies,
      meta: {
        total: 3,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });

    expect(dto.data).toHaveLength(3);
    expect(dto.data[0].id).toBe('id-1');
    expect(dto.data[1].id).toBe('id-2');
    expect(dto.data[2].id).toBe('id-3');
  });

  it('should handle different page numbers', () => {
    const dto = new PaginatedCompaniesResponseDto({
      data: [],
      meta: {
        total: 100,
        page: 5,
        limit: 10,
        totalPages: 10,
      },
    });

    expect(dto.meta.page).toBe(5);
  });

  it('should handle different limit values', () => {
    const dto = new PaginatedCompaniesResponseDto({
      data: [],
      meta: {
        total: 100,
        page: 1,
        limit: 25,
        totalPages: 4,
      },
    });

    expect(dto.meta.limit).toBe(25);
    expect(dto.meta.totalPages).toBe(4);
  });

  it('should calculate correct totalPages from total and limit', () => {
    const dto = new PaginatedCompaniesResponseDto({
      data: [],
      meta: {
        total: 47,
        page: 1,
        limit: 10,
        totalPages: 5, // ceil(47/10) = 5
      },
    });

    expect(dto.meta.totalPages).toBe(5);
  });

  it('should have 2 main properties: data and meta', () => {
    const dto = new PaginatedCompaniesResponseDto({
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    });

    const keys = Object.keys(dto);
    expect(keys).toHaveLength(2);
    expect(keys).toContain('data');
    expect(keys).toContain('meta');
  });

  it('should have meta with 4 properties', () => {
    const dto = new PaginatedCompaniesResponseDto({
      data: [],
      meta: {
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10,
      },
    });

    const metaKeys = Object.keys(dto.meta);
    expect(metaKeys).toHaveLength(4);
    expect(metaKeys).toContain('total');
    expect(metaKeys).toContain('page');
    expect(metaKeys).toContain('limit');
    expect(metaKeys).toContain('totalPages');
  });

  it('should handle partial properties via constructor', () => {
    const dto = new PaginatedCompaniesResponseDto({
      data: [],
    } as any);

    expect(dto.data).toEqual([]);
  });

  it('should preserve array reference for data', () => {
    const dataArray: CompanyResponseDto[] = [];
    
    const dto = new PaginatedCompaniesResponseDto({
      data: dataArray,
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    });

    expect(dto.data).toBe(dataArray);
  });

  it('should handle large total values', () => {
    const dto = new PaginatedCompaniesResponseDto({
      data: [],
      meta: {
        total: 1000000,
        page: 1,
        limit: 100,
        totalPages: 10000,
      },
    });

    expect(dto.meta.total).toBe(1000000);
    expect(dto.meta.totalPages).toBe(10000);
  });

  it('should handle last page correctly', () => {
    const dto = new PaginatedCompaniesResponseDto({
      data: [],
      meta: {
        total: 95,
        page: 10,
        limit: 10,
        totalPages: 10,
      },
    });

    expect(dto.meta.page).toBe(10);
    expect(dto.meta.page).toBe(dto.meta.totalPages);
  });
});

