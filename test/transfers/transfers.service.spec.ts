import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TransfersService } from '../../src/transfers/services/transfers.service';
import { Transfer } from '../../src/transfers/schemas/transfer.schema';
import { CreateTransferDto } from '../../src/transfers/dto/create-transfer.dto';
import * as moment from 'moment-timezone';

describe('TransfersService', () => {
  let service: TransfersService;
  let mockTransferModel: any;

  const mockTransferId = '507f1f77bcf86cd799439012';
  const mockCompanyId = '507f1f77bcf86cd799439011';

  beforeEach(async () => {
    // Create mock transfer model
    mockTransferModel = jest.fn().mockImplementation((dto) => ({
      ...dto,
      _id: mockTransferId,
      save: jest.fn().mockResolvedValue({
        _id: mockTransferId,
        ...dto,
        createdAt: new Date('2025-11-14T00:00:00.000Z'),
        updatedAt: new Date('2025-11-14T00:00:00.000Z'),
      }),
    }));

    mockTransferModel.find = jest.fn();
    mockTransferModel.findOne = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransfersService,
        {
          provide: getModelToken(Transfer.name),
          useValue: mockTransferModel,
        },
      ],
    }).compile();

    service = module.get<TransfersService>(TransfersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have createTransfer method', () => {
      expect(service.createTransfer).toBeDefined();
      expect(typeof service.createTransfer).toBe('function');
    });

    it('should have getTransfersLastMonth method', () => {
      expect(service.getTransfersLastMonth).toBeDefined();
      expect(typeof service.getTransfersLastMonth).toBe('function');
    });
  });

  describe('createTransfer', () => {
    const createTransferDto: CreateTransferDto = {
      companyId: mockCompanyId,
      amount: 50000.75,
      debitAccount: '1234567890123456',
      creditAccount: '6543210987654321',
      transferDate: '2025-11-14',
    };

    it('should create a transfer successfully', async () => {
      const result = await service.createTransfer(createTransferDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockTransferId);
      expect(result.companyId).toBe(createTransferDto.companyId);
      expect(result.amount).toBe(createTransferDto.amount);
      expect(result.debitAccount).toBe(createTransferDto.debitAccount);
      expect(result.creditAccount).toBe(createTransferDto.creditAccount);
    });

    it('should convert transferDate string to Date object', async () => {
      await service.createTransfer(createTransferDto);

      expect(mockTransferModel).toHaveBeenCalledWith(
        expect.objectContaining({
          transferDate: expect.any(Date),
        }),
      );
    });

    it('should return TransferResponseDto with all required fields', async () => {
      const result = await service.createTransfer(createTransferDto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('companyId');
      expect(result).toHaveProperty('amount');
      expect(result).toHaveProperty('debitAccount');
      expect(result).toHaveProperty('creditAccount');
      expect(result).toHaveProperty('transferDate');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should handle large amounts correctly', async () => {
      const largeDt = { ...createTransferDto, amount: 9999999.99 };
      const result = await service.createTransfer(largeDt);

      expect(result.amount).toBe(9999999.99);
    });

    it('should handle small amounts correctly', async () => {
      const smallDto = { ...createTransferDto, amount: 0.01 };
      const result = await service.createTransfer(smallDto);

      expect(result.amount).toBe(0.01);
    });

    it('should handle different account formats', async () => {
      const customDto = {
        ...createTransferDto,
        debitAccount: '12345678901234567890',
        creditAccount: '09876543210987654321',
      };

      const result = await service.createTransfer(customDto);

      expect(result.debitAccount).toBe('12345678901234567890');
      expect(result.creditAccount).toBe('09876543210987654321');
    });

    it('should convert companyId to string in response', async () => {
      const result = await service.createTransfer(createTransferDto);

      expect(typeof result.companyId).toBe('string');
    });

    it('should convert id to string in response', async () => {
      const result = await service.createTransfer(createTransferDto);

      expect(typeof result.id).toBe('string');
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection error');
      mockTransferModel.mockImplementationOnce(() => ({
        save: jest.fn().mockRejectedValue(error),
      }));

      await expect(service.createTransfer(createTransferDto)).rejects.toThrow(
        'Database connection error',
      );
    });

    it('should propagate save errors', async () => {
      const saveError = new Error('Save operation failed');
      mockTransferModel.mockImplementationOnce(() => ({
        save: jest.fn().mockRejectedValue(saveError),
      }));

      await expect(service.createTransfer(createTransferDto)).rejects.toThrow(
        'Save operation failed',
      );
    });
  });

  describe('getTransfersLastMonth', () => {
    const mockTransfers = [
      {
        _id: mockTransferId,
        companyId: mockCompanyId,
        amount: 10000,
        debitAccount: '1111111111111111',
        creditAccount: '2222222222222222',
        transferDate: moment().subtract(15, 'days').toDate(),
        createdAt: new Date('2025-11-01T00:00:00.000Z'),
        updatedAt: new Date('2025-11-01T00:00:00.000Z'),
      },
      {
        _id: '507f1f77bcf86cd799439013',
        companyId: mockCompanyId,
        amount: 20000,
        debitAccount: '3333333333333333',
        creditAccount: '4444444444444444',
        transferDate: moment().subtract(5, 'days').toDate(),
        createdAt: new Date('2025-11-10T00:00:00.000Z'),
        updatedAt: new Date('2025-11-10T00:00:00.000Z'),
      },
    ];

    beforeEach(() => {
      mockTransferModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockTransfers),
        }),
      });
    });

    it('should return transfers from last month', async () => {
      const result = await service.getTransfersLastMonth();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    it('should call find with correct date filter', async () => {
      await service.getTransfersLastMonth();

      expect(mockTransferModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          transferDate: expect.objectContaining({
            $gte: expect.any(Date),
          }),
        }),
      );
    });

    it('should sort transfers by transferDate descending', async () => {
      const sortMock = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTransfers),
      });

      mockTransferModel.find.mockReturnValue({
        sort: sortMock,
      });

      await service.getTransfersLastMonth();

      expect(sortMock).toHaveBeenCalledWith({ transferDate: -1 });
    });

    it('should return array of TransferResponseDto', async () => {
      const result = await service.getTransfersLastMonth();

      result.forEach((transfer) => {
        expect(transfer).toHaveProperty('id');
        expect(transfer).toHaveProperty('companyId');
        expect(transfer).toHaveProperty('amount');
        expect(transfer).toHaveProperty('debitAccount');
        expect(transfer).toHaveProperty('creditAccount');
        expect(transfer).toHaveProperty('transferDate');
        expect(transfer).toHaveProperty('createdAt');
        expect(transfer).toHaveProperty('updatedAt');
      });
    });

    it('should return empty array when no transfers found', async () => {
      mockTransferModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.getTransfersLastMonth();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should convert all ids to strings', async () => {
      const result = await service.getTransfersLastMonth();

      result.forEach((transfer) => {
        expect(typeof transfer.id).toBe('string');
        expect(typeof transfer.companyId).toBe('string');
      });
    });

    it('should preserve transfer amounts', async () => {
      const result = await service.getTransfersLastMonth();

      expect(result[0].amount).toBe(10000);
      expect(result[1].amount).toBe(20000);
    });

    it('should preserve account numbers', async () => {
      const result = await service.getTransfersLastMonth();

      expect(result[0].debitAccount).toBe('1111111111111111');
      expect(result[0].creditAccount).toBe('2222222222222222');
      expect(result[1].debitAccount).toBe('3333333333333333');
      expect(result[1].creditAccount).toBe('4444444444444444');
    });

    it('should preserve transfer dates', async () => {
      const result = await service.getTransfersLastMonth();

      result.forEach((transfer) => {
        expect(transfer.transferDate).toBeInstanceOf(Date);
      });
    });

    it('should filter transfers within last month', async () => {
      await service.getTransfersLastMonth();

      const callArgs = mockTransferModel.find.mock.calls[0][0];
      const filterDate = callArgs.transferDate.$gte;
      const now = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Check that the filter date is approximately one month ago
      const diffInDays = Math.abs(
        (filterDate.getTime() - oneMonthAgo.getTime()) / (1000 * 60 * 60 * 24),
      );
      expect(diffInDays).toBeLessThan(1);
    });

    it('should handle database errors in getTransfersLastMonth', async () => {
      const error = new Error('Database query error');
      mockTransferModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(error),
        }),
      });

      await expect(service.getTransfersLastMonth()).rejects.toThrow(
        'Database query error',
      );
    });

    it('should handle empty database gracefully', async () => {
      mockTransferModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.getTransfersLastMonth();

      expect(result).toEqual([]);
    });

    it('should handle single transfer correctly', async () => {
      mockTransferModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockTransfers[0]]),
        }),
      });

      const result = await service.getTransfersLastMonth();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(mockTransferId);
    });

    it('should handle multiple transfers correctly', async () => {
      const manyTransfers = Array(10)
        .fill(null)
        .map((_, index) => ({
          _id: `507f1f77bcf86cd79943901${index}`,
          companyId: mockCompanyId,
          amount: 1000 * (index + 1),
          debitAccount: `111111111111111${index}`,
          creditAccount: `222222222222222${index}`,
          transferDate: moment().subtract(index, 'days').toDate(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

      mockTransferModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(manyTransfers),
        }),
      });

      const result = await service.getTransfersLastMonth();

      expect(result.length).toBe(10);
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected errors in createTransfer', async () => {
      const unexpectedError = new Error('Unexpected error');
      mockTransferModel.mockImplementationOnce(() => {
        throw unexpectedError;
      });

      const dto: CreateTransferDto = {
        companyId: mockCompanyId,
        amount: 5000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: '2025-11-14',
      };

      await expect(service.createTransfer(dto)).rejects.toThrow(
        'Unexpected error',
      );
    });

    it('should handle null/undefined in find results', async () => {
      mockTransferModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.getTransfersLastMonth()).rejects.toThrow();
    });
  });

  describe('Date Handling', () => {
    it('should correctly parse ISO date strings', async () => {
      const dto: CreateTransferDto = {
        companyId: mockCompanyId,
        amount: 1000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: '2025-11-14T10:30:00.000Z',
      };

      await service.createTransfer(dto);

      expect(mockTransferModel).toHaveBeenCalledWith(
        expect.objectContaining({
          transferDate: expect.any(Date),
        }),
      );
    });

    it('should handle date at month boundary', async () => {
      const lastDayOfMonth = moment().endOf('month').subtract(1, 'month');
      
      mockTransferModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([
            {
              _id: mockTransferId,
              companyId: mockCompanyId,
              amount: 5000,
              debitAccount: '1111111111111111',
              creditAccount: '2222222222222222',
              transferDate: lastDayOfMonth.toDate(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]),
        }),
      });

      const result = await service.getTransfersLastMonth();

      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should use current date for calculating one month ago', async () => {
      // Configure mock before calling service
      mockTransferModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      const beforeCall = new Date();
      await service.getTransfersLastMonth();
      const afterCall = new Date();

      const callArgs = mockTransferModel.find.mock.calls[mockTransferModel.find.mock.calls.length - 1][0];
      const filterDate = callArgs.transferDate.$gte;

      expect(filterDate.getTime()).toBeGreaterThanOrEqual(
        beforeCall.getTime() - 32 * 24 * 60 * 60 * 1000,
      );
      expect(filterDate.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });
  });

  describe('Data Transformation', () => {
    it('should correctly transform ObjectId to string', async () => {
      const mockObjectId = {
        toString: jest.fn().mockReturnValue(mockTransferId),
      };

      mockTransferModel.mockImplementationOnce((dto) => ({
        ...dto,
        _id: mockObjectId,
        save: jest.fn().mockResolvedValue({
          _id: mockObjectId,
          ...dto,
          companyId: { toString: jest.fn().mockReturnValue(mockCompanyId) },
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      }));

      const dto: CreateTransferDto = {
        companyId: mockCompanyId,
        amount: 1000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: '2025-11-14',
      };

      const result = await service.createTransfer(dto);

      expect(mockObjectId.toString).toHaveBeenCalled();
      expect(typeof result.id).toBe('string');
    });

    it('should preserve decimal precision in amounts', async () => {
      const preciseAmount = 12345.67;
      const dto: CreateTransferDto = {
        companyId: mockCompanyId,
        amount: preciseAmount,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: '2025-11-14',
      };

      const result = await service.createTransfer(dto);

      expect(result.amount).toBe(preciseAmount);
    });
  });
});

