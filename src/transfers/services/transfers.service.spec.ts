import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TransfersService } from './transfers.service';
import { Transfer } from '../schemas/transfer.schema';

describe('TransfersService', () => {
  let service: TransfersService;
  let mockTransferModel: any;

  beforeEach(async () => {
    mockTransferModel = {
      find: jest.fn(),
      constructor: jest.fn(),
    };

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTransfersLastMonth', () => {
    it('should return transfers from the last month', async () => {
      const mockTransfers = [
        {
          _id: '1',
          companyId: 'company-id',
          amount: 100000,
          debitAccount: '0000003100012345678',
          creditAccount: '0000003200087654321',
          transferDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockTransferModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockTransfers),
        }),
      });

      const result = await service.getTransfersLastMonth();

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(100000);
    });

    it('should return empty array if no transfers found', async () => {
      mockTransferModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.getTransfersLastMonth();

      expect(result).toHaveLength(0);
    });
  });
});


