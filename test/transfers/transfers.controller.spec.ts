import { Test, TestingModule } from '@nestjs/testing';
import { TransfersController } from '../../src/transfers/controllers/transfers.controller';
import { TransfersService } from '../../src/transfers/services/transfers.service';

describe('TransfersController (Unit)', () => {
  let controller: TransfersController;
  let service: TransfersService;

  const mockTransfersService = {
    createTransfer: jest.fn(),
    getTransfersLastMonth: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransfersController],
      providers: [
        {
          provide: TransfersService,
          useValue: mockTransfersService,
        },
      ],
    }).compile();

    controller = module.get<TransfersController>(TransfersController);
    service = module.get<TransfersService>(TransfersService);

    // Clear mocks before each test
    jest.clearAllMocks();
  });

  describe('createTransfer', () => {
    it('should call service.createTransfer with correct parameters', async () => {
      const createDto = {
        companyId: '507f1f77bcf86cd799439011',
        amount: 50000,
        transferDate: '2024-11-20',
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
      };

      const mockResponse = {
        id: '507f1f77bcf86cd799439012',
        companyId: createDto.companyId,
        amount: createDto.amount,
        transferDate: new Date('2024-11-20'),
        debitAccount: createDto.debitAccount,
        creditAccount: createDto.creditAccount,
        createdAt: new Date(),
      };

      mockTransfersService.createTransfer.mockResolvedValue(mockResponse);

      const result = await controller.createTransfer(createDto as any);

      expect(service.createTransfer).toHaveBeenCalledWith(createDto);
      expect(service.createTransfer).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from service', async () => {
      const createDto = {
        companyId: 'invalid-id',
        amount: 50000,
        transferDate: '2024-11-20',
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
      };

      const error = new Error('Company not found');
      mockTransfersService.createTransfer.mockRejectedValue(error);

      await expect(controller.createTransfer(createDto as any)).rejects.toThrow('Company not found');
      expect(service.createTransfer).toHaveBeenCalledWith(createDto);
    });
  });

  describe('getTransfersLastMonth', () => {
    it('should call service.getTransfersLastMonth and return result', async () => {
      const mockTransfers = [
        {
          id: '507f1f77bcf86cd799439012',
          companyId: '507f1f77bcf86cd799439011',
          amount: 50000,
          transferDate: new Date('2024-11-20'),
          debitAccount: '1234567890123456',
          creditAccount: '6543210987654321',
          createdAt: new Date(),
        },
        {
          id: '507f1f77bcf86cd799439013',
          companyId: '507f1f77bcf86cd799439011',
          amount: 75000,
          transferDate: new Date('2024-11-19'),
          debitAccount: '9876543210987654',
          creditAccount: '4567890123456789',
          createdAt: new Date(),
        },
      ];

      mockTransfersService.getTransfersLastMonth.mockResolvedValue(mockTransfers);

      const result = await controller.getTransfersLastMonth();

      expect(service.getTransfersLastMonth).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTransfers);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no transfers exist', async () => {
      mockTransfersService.getTransfersLastMonth.mockResolvedValue([]);

      const result = await controller.getTransfersLastMonth();

      expect(service.getTransfersLastMonth).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should propagate errors from service', async () => {
      const error = new Error('Database connection failed');
      mockTransfersService.getTransfersLastMonth.mockRejectedValue(error);

      await expect(controller.getTransfersLastMonth()).rejects.toThrow('Database connection failed');
      expect(service.getTransfersLastMonth).toHaveBeenCalledTimes(1);
    });
  });
});

