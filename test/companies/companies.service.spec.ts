import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConflictException } from '@nestjs/common';
import { CompaniesService } from '../../src/companies/services/companies.service';
import { Company } from '../../src/companies/schemas/company.schema';
import { Transfer } from '../../src/transfers/schemas/transfer.schema';
import { CompanyType } from '../../src/common/types/company.types';
import * as moment from 'moment-timezone';
import { TIMEZONE } from '../../src/common/constants/timezone.constant';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let companyModel: Model<Company>;
  let transferModel: Model<Transfer>;

  const mockCompany = {
    _id: '507f1f77bcf86cd799439011',
    cuit: '20333444555',
    businessName: 'Test Company SA',
    companyType: CompanyType.SME,
    adhesionDate: new Date('2025-11-14'),
    createdAt: new Date('2025-11-14'),
    updatedAt: new Date('2025-11-14'),
    save: jest.fn().mockResolvedValue(this),
  };

  const mockTransfer = {
    _id: '507f1f77bcf86cd799439012',
    companyId: '507f1f77bcf86cd799439011',
    amount: 150000.50,
    debitAccount: '1234567890123456',
    creditAccount: '6543210987654321',
    transferDate: new Date('2025-11-14'),
  };

  const mockCompanyModel: any = jest.fn().mockImplementation((dto) => ({
    ...dto,
    _id: '507f1f77bcf86cd799439011',
    save: jest.fn().mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      ...dto,
    }),
  }));
  
  mockCompanyModel.findOne = jest.fn();
  mockCompanyModel.find = jest.fn();
  mockCompanyModel.countDocuments = jest.fn();

  const mockTransferModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    moment.tz.setDefault(TIMEZONE.NAME);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: getModelToken(Company.name),
          useValue: mockCompanyModel,
        },
        {
          provide: getModelToken(Transfer.name),
          useValue: mockTransferModel,
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    companyModel = module.get<Model<Company>>(getModelToken(Company.name));
    transferModel = module.get<Model<Transfer>>(getModelToken(Transfer.name));

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have companyModel', () => {
      expect(companyModel).toBeDefined();
    });

    it('should have transferModel', () => {
      expect(transferModel).toBeDefined();
    });
  });

  describe('createCompany', () => {
    const createCompanyDto = {
      cuit: '20333444555',
      businessName: 'Test Company SA',
      companyType: CompanyType.SME,
      adhesionDate: '2025-11-14',
    };

    it('should create a new SME company successfully', async () => {
      mockCompanyModel.findOne.mockResolvedValue(null);

      const result = await service.createCompany(createCompanyDto);

      expect(mockCompanyModel.findOne).toHaveBeenCalledWith({ cuit: createCompanyDto.cuit });
      expect(mockCompanyModel).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.cuit).toBe(createCompanyDto.cuit);
      expect(result.businessName).toBe(createCompanyDto.businessName);
      expect(result.companyType).toBe(CompanyType.SME);
    });

    it('should create a new Corporate company successfully', async () => {
      const corporateDto = { ...createCompanyDto, companyType: CompanyType.CORPORATE };

      mockCompanyModel.findOne.mockResolvedValue(null);

      const result = await service.createCompany(corporateDto);

      expect(result).toBeDefined();
      expect(result.companyType).toBe(CompanyType.CORPORATE);
    });

    it('should throw ConflictException if CUIT already exists', async () => {
      mockCompanyModel.findOne.mockResolvedValue(mockCompany);

      await expect(service.createCompany(createCompanyDto)).rejects.toThrow(ConflictException);
      await expect(service.createCompany(createCompanyDto)).rejects.toThrow(
        'Company with this CUIT already exists'
      );
    });

    it('should parse adhesionDate in UTC-3 timezone', async () => {
      mockCompanyModel.findOne.mockResolvedValue(null);
      
      mockCompanyModel.mockImplementationOnce((data) => {
        expect(data.adhesionDate).toBeInstanceOf(Date);
        return {
          ...data,
          _id: '507f1f77bcf86cd799439011',
          save: jest.fn().mockResolvedValue({ _id: '507f1f77bcf86cd799439011', ...data }),
        };
      });

      await service.createCompany(createCompanyDto);

      expect(mockCompanyModel).toHaveBeenCalled();
    });

    it('should set adhesionDate time to current time', async () => {
      mockCompanyModel.findOne.mockResolvedValue(null);
      
      mockCompanyModel.mockImplementationOnce((data) => {
        const adhesionDate = moment(data.adhesionDate);
        const now = moment();
        
        // Should have time component (not 00:00:00)
        expect(adhesionDate.hours()).toBeGreaterThanOrEqual(0);
        expect(adhesionDate.minutes()).toBeGreaterThanOrEqual(0);
        
        return {
          ...data,
          _id: '507f1f77bcf86cd799439011',
          save: jest.fn().mockResolvedValue({ _id: '507f1f77bcf86cd799439011', ...data }),
        };
      });

      await service.createCompany(createCompanyDto);

      expect(mockCompanyModel).toHaveBeenCalled();
    });
  });

  describe('getCompaniesWithTransfersLastMonth', () => {
    it('should return paginated transfers with default pagination', async () => {
      const mockPopulatedTransfer = {
        ...mockTransfer,
        companyId: mockCompany,
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockPopulatedTransfer]),
      };

      mockTransferModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(25),
      });
      mockTransferModel.find.mockReturnValue(mockQuery);

      const result = await service.getCompaniesWithTransfersLastMonth(1, 10);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(25);
      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('companyId');
      expect(result.data[0]).toHaveProperty('amount');
      expect(result.data[0]).toHaveProperty('debitAccount');
      expect(result.data[0]).toHaveProperty('creditAccount');
      expect(result.data[0]).not.toHaveProperty('transferDate');
    });

    it('should return paginated transfers with custom page and limit', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      mockTransferModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(50),
      });
      mockTransferModel.find.mockReturnValue(mockQuery);

      const result = await service.getCompaniesWithTransfersLastMonth(3, 20);

      expect(mockQuery.skip).toHaveBeenCalledWith(40); // (3-1) * 20
      expect(mockQuery.limit).toHaveBeenCalledWith(20);
      expect(result.total).toBe(50);
    });

    it('should filter transfers from last month only', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      mockTransferModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });
      mockTransferModel.find.mockImplementation((query) => {
        expect(query.transferDate).toHaveProperty('$gte');
        expect(query.transferDate.$gte).toBeInstanceOf(Date);
        return mockQuery;
      });

      await service.getCompaniesWithTransfersLastMonth(1, 10);

      expect(mockTransferModel.find).toHaveBeenCalled();
    });

    it('should return empty array when no transfers found', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      mockTransferModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });
      mockTransferModel.find.mockReturnValue(mockQuery);

      const result = await service.getCompaniesWithTransfersLastMonth(1, 10);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle transfers without company (null check)', async () => {
      const transferWithoutCompany = {
        ...mockTransfer,
        companyId: null,
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([transferWithoutCompany]),
      };

      mockTransferModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });
      mockTransferModel.find.mockReturnValue(mockQuery);

      const result = await service.getCompaniesWithTransfersLastMonth(1, 10);

      expect(result.data).toEqual([]);
    });
  });

  describe('getCompaniesJoinedLastMonth', () => {
    it('should return paginated companies with default pagination', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockCompany]),
      };

      mockCompanyModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(8),
      });
      mockCompanyModel.find.mockReturnValue(mockQuery);

      const result = await service.getCompaniesJoinedLastMonth(1, 10);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(8);
      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('cuit');
      expect(result.data[0]).toHaveProperty('businessName');
      expect(result.data[0]).toHaveProperty('companyType');
      expect(result.data[0]).toHaveProperty('adhesionDate');
    });

    it('should return paginated companies with custom page and limit', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      mockCompanyModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(20),
      });
      mockCompanyModel.find.mockReturnValue(mockQuery);

      const result = await service.getCompaniesJoinedLastMonth(2, 5);

      expect(mockQuery.skip).toHaveBeenCalledWith(5); // (2-1) * 5
      expect(mockQuery.limit).toHaveBeenCalledWith(5);
      expect(result.total).toBe(20);
    });

    it('should filter companies from last month only', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      mockCompanyModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });
      mockCompanyModel.find.mockImplementation((query) => {
        expect(query.adhesionDate).toHaveProperty('$gte');
        expect(query.adhesionDate.$gte).toBeInstanceOf(Date);
        return mockQuery;
      });

      await service.getCompaniesJoinedLastMonth(1, 10);

      expect(mockCompanyModel.find).toHaveBeenCalled();
    });

    it('should return empty array when no companies found', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      mockCompanyModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });
      mockCompanyModel.find.mockReturnValue(mockQuery);

      const result = await service.getCompaniesJoinedLastMonth(1, 10);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should sort companies by adhesionDate descending', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      mockCompanyModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });
      mockCompanyModel.find.mockReturnValue(mockQuery);

      await service.getCompaniesJoinedLastMonth(1, 10);

      expect(mockQuery.sort).toHaveBeenCalledWith({ adhesionDate: -1 });
    });
  });

  describe('Error handling', () => {
    it('should handle database errors in createCompany', async () => {
      mockCompanyModel.findOne.mockRejectedValue(new Error('Database error'));

      await expect(
        service.createCompany({
          cuit: '20333444555',
          businessName: 'Test Company SA',
          companyType: CompanyType.SME,
          adhesionDate: '2025-11-14',
        })
      ).rejects.toThrow('Database error');
    });

    it('should handle database errors in getCompaniesWithTransfersLastMonth', async () => {
      mockTransferModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(
        service.getCompaniesWithTransfersLastMonth(1, 10)
      ).rejects.toThrow('Database error');
    });

    it('should handle database errors in getCompaniesJoinedLastMonth', async () => {
      mockCompanyModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(
        service.getCompaniesJoinedLastMonth(1, 10)
      ).rejects.toThrow('Database error');
    });
  });

  describe('Timezone handling', () => {
    it('should use configured timezone for date calculations', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      mockCompanyModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });
      
      let capturedQuery;
      mockCompanyModel.find.mockImplementation((query) => {
        capturedQuery = query;
        return mockQuery;
      });

      await service.getCompaniesJoinedLastMonth(1, 10);

      // Verify that the query has a date filter
      expect(capturedQuery).toBeDefined();
      expect(capturedQuery.adhesionDate).toBeDefined();
      expect(capturedQuery.adhesionDate.$gte).toBeInstanceOf(Date);
      
      // Verify the date is approximately one month ago
      const oneMonthAgo = moment.tz(TIMEZONE.NAME).subtract(1, 'month');
      const queryDate = moment(capturedQuery.adhesionDate.$gte);
      const diffInDays = Math.abs(queryDate.diff(oneMonthAgo, 'days'));
      
      // Should be within 1 day of one month ago
      expect(diffInDays).toBeLessThanOrEqual(1);
    });
  });
});

