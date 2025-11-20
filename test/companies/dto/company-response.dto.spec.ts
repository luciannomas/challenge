import { CompanyResponseDto } from '../../../src/companies/dto/company-response.dto';
import { CompanyType } from '../../../src/common/types/company.types';

describe('CompanyResponseDto', () => {
  it('should be defined', () => {
    expect(CompanyResponseDto).toBeDefined();
  });

  it('should create instance with all properties', () => {
    const mockDate = new Date('2024-01-15T10:00:00Z');
    
    const dto = new CompanyResponseDto({
      id: '691659ca75073179dfe1d7da',
      cuit: '20333444555',
      businessName: 'Tech Solutions SA',
      companyType: CompanyType.SME,
      adhesionDate: mockDate,
      createdAt: mockDate,
      updatedAt: mockDate,
    });

    expect(dto.id).toBe('691659ca75073179dfe1d7da');
    expect(dto.cuit).toBe('20333444555');
    expect(dto.businessName).toBe('Tech Solutions SA');
    expect(dto.companyType).toBe(CompanyType.SME);
    expect(dto.adhesionDate).toBe(mockDate);
    expect(dto.createdAt).toBe(mockDate);
    expect(dto.updatedAt).toBe(mockDate);
  });

  it('should create instance with partial properties', () => {
    const dto = new CompanyResponseDto({
      id: 'test-id',
      cuit: '20111222333',
    });

    expect(dto.id).toBe('test-id');
    expect(dto.cuit).toBe('20111222333');
  });

  it('should handle corporate company type', () => {
    const dto = new CompanyResponseDto({
      id: 'test-id',
      companyType: CompanyType.CORPORATE,
    });

    expect(dto.companyType).toBe(CompanyType.CORPORATE);
  });

  it('should preserve date objects', () => {
    const adhesionDate = new Date('2024-01-15');
    const createdAt = new Date('2024-01-16');
    const updatedAt = new Date('2024-01-17');

    const dto = new CompanyResponseDto({
      id: 'test-id',
      adhesionDate,
      createdAt,
      updatedAt,
    });

    expect(dto.adhesionDate).toBe(adhesionDate);
    expect(dto.createdAt).toBe(createdAt);
    expect(dto.updatedAt).toBe(updatedAt);
    expect(dto.adhesionDate).toBeInstanceOf(Date);
    expect(dto.createdAt).toBeInstanceOf(Date);
    expect(dto.updatedAt).toBeInstanceOf(Date);
  });

  it('should handle CUIT as string', () => {
    const dto = new CompanyResponseDto({
      id: 'test-id',
      cuit: '30555666777',
    });

    expect(typeof dto.cuit).toBe('string');
    expect(dto.cuit).toBe('30555666777');
  });

  it('should handle business name with special characters', () => {
    const dto = new CompanyResponseDto({
      id: 'test-id',
      businessName: 'Empresa & Compañía S.A.',
    });

    expect(dto.businessName).toBe('Empresa & Compañía S.A.');
  });

  it('should have 7 properties when fully populated', () => {
    const mockDate = new Date();
    
    const dto = new CompanyResponseDto({
      id: 'test-id',
      cuit: '20333444555',
      businessName: 'Test Company',
      companyType: CompanyType.SME,
      adhesionDate: mockDate,
      createdAt: mockDate,
      updatedAt: mockDate,
    });

    const keys = Object.keys(dto);
    expect(keys).toHaveLength(7);
    expect(keys).toContain('id');
    expect(keys).toContain('cuit');
    expect(keys).toContain('businessName');
    expect(keys).toContain('companyType');
    expect(keys).toContain('adhesionDate');
    expect(keys).toContain('createdAt');
    expect(keys).toContain('updatedAt');
  });
});

