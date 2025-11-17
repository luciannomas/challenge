import { PaginatedTransfersResponseDto } from '../../../src/companies/dto/paginated-transfers-response.dto';
import { TransferWithCompanyDto } from '../../../src/companies/dto/company-with-transfers.dto';

describe('PaginatedTransfersResponseDto', () => {
  const mockTransfer1 = new TransferWithCompanyDto({
    id: '507f1f77bcf86cd799439012',
    companyId: '507f1f77bcf86cd799439011',
    amount: 150000.50,
    debitAccount: '1234567890123456',
    creditAccount: '6543210987654321',
  });

  const mockTransfer2 = new TransferWithCompanyDto({
    id: '507f1f77bcf86cd799439013',
    companyId: '507f1f77bcf86cd799439011',
    amount: 75000.25,
    debitAccount: '9876543210987654',
    creditAccount: '1234567890123456',
  });

  describe('Constructor', () => {
    it('should create instance with data and meta', () => {
      const paginatedDto = new PaginatedTransfersResponseDto({
        data: [mockTransfer1, mockTransfer2],
        meta: {
          total: 25,
          page: 1,
          limit: 10,
          totalPages: 3,
        },
      });

      expect(paginatedDto.data).toHaveLength(2);
      expect(paginatedDto.data[0]).toBe(mockTransfer1);
      expect(paginatedDto.data[1]).toBe(mockTransfer2);
      expect(paginatedDto.meta.total).toBe(25);
      expect(paginatedDto.meta.page).toBe(1);
      expect(paginatedDto.meta.limit).toBe(10);
      expect(paginatedDto.meta.totalPages).toBe(3);
    });

    it('should create instance with empty data array', () => {
      const paginatedDto = new PaginatedTransfersResponseDto({
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
      const paginatedDto = new PaginatedTransfersResponseDto({
        data: [mockTransfer1],
        meta: {
          total: 50,
          page: 3,
          limit: 10,
          totalPages: 5,
        },
      });

      expect(paginatedDto.meta.total).toBe(50);
      expect(paginatedDto.meta.page).toBe(3);
      expect(paginatedDto.meta.limit).toBe(10);
      expect(paginatedDto.meta.totalPages).toBe(5);
    });

    it('should handle custom limit', () => {
      const paginatedDto = new PaginatedTransfersResponseDto({
        data: [mockTransfer1, mockTransfer2],
        meta: {
          total: 100,
          page: 1,
          limit: 20,
          totalPages: 5,
        },
      });

      expect(paginatedDto.meta.limit).toBe(20);
      expect(paginatedDto.meta.totalPages).toBe(5);
    });

    it('should handle last page with fewer items', () => {
      const paginatedDto = new PaginatedTransfersResponseDto({
        data: [mockTransfer1],
        meta: {
          total: 31,
          page: 4,
          limit: 10,
          totalPages: 4,
        },
      });

      expect(paginatedDto.data).toHaveLength(1);
      expect(paginatedDto.meta.page).toBe(4);
      expect(paginatedDto.meta.total).toBe(31);
    });

    it('should handle maximum limit of 100', () => {
      const paginatedDto = new PaginatedTransfersResponseDto({
        data: Array(10).fill(mockTransfer1),
        meta: {
          total: 200,
          page: 1,
          limit: 100,
          totalPages: 2,
        },
      });

      expect(paginatedDto.meta.limit).toBe(100);
      expect(paginatedDto.meta.totalPages).toBe(2);
    });
  });

  describe('Meta properties', () => {
    it('should have all required meta properties', () => {
      const paginatedDto = new PaginatedTransfersResponseDto({
        data: [mockTransfer1],
        meta: {
          total: 25,
          page: 1,
          limit: 10,
          totalPages: 3,
        },
      });

      expect(paginatedDto.meta).toHaveProperty('total');
      expect(paginatedDto.meta).toHaveProperty('page');
      expect(paginatedDto.meta).toHaveProperty('limit');
      expect(paginatedDto.meta).toHaveProperty('totalPages');
    });

    it('should have correct meta property types', () => {
      const paginatedDto = new PaginatedTransfersResponseDto({
        data: [mockTransfer1],
        meta: {
          total: 25,
          page: 1,
          limit: 10,
          totalPages: 3,
        },
      });

      expect(typeof paginatedDto.meta.total).toBe('number');
      expect(typeof paginatedDto.meta.page).toBe('number');
      expect(typeof paginatedDto.meta.limit).toBe('number');
      expect(typeof paginatedDto.meta.totalPages).toBe('number');
    });
  });

  describe('Data array', () => {
    it('should contain TransferWithCompanyDto instances', () => {
      const paginatedDto = new PaginatedTransfersResponseDto({
        data: [mockTransfer1, mockTransfer2],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      expect(paginatedDto.data[0]).toBeInstanceOf(TransferWithCompanyDto);
      expect(paginatedDto.data[1]).toBeInstanceOf(TransferWithCompanyDto);
    });

    it('should preserve transfer data properties', () => {
      const paginatedDto = new PaginatedTransfersResponseDto({
        data: [mockTransfer1],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      const transfer = paginatedDto.data[0];
      expect(transfer).toHaveProperty('id');
      expect(transfer).toHaveProperty('companyId');
      expect(transfer).toHaveProperty('amount');
      expect(transfer).toHaveProperty('debitAccount');
      expect(transfer).toHaveProperty('creditAccount');
    });

    it('should not include transferDate in data', () => {
      const paginatedDto = new PaginatedTransfersResponseDto({
        data: [mockTransfer1],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      const transfer = paginatedDto.data[0];
      expect(transfer).not.toHaveProperty('transferDate');
    });
  });

  describe('Pagination calculations', () => {
    it('should reflect correct pagination for first page', () => {
      const paginatedDto = new PaginatedTransfersResponseDto({
        data: Array(10).fill(mockTransfer1),
        meta: {
          total: 50,
          page: 1,
          limit: 10,
          totalPages: 5,
        },
      });

      expect(paginatedDto.meta.page).toBe(1);
      expect(paginatedDto.data.length).toBe(10);
    });

    it('should reflect correct pagination for middle page', () => {
      const paginatedDto = new PaginatedTransfersResponseDto({
        data: Array(10).fill(mockTransfer1),
        meta: {
          total: 50,
          page: 3,
          limit: 10,
          totalPages: 5,
        },
      });

      expect(paginatedDto.meta.page).toBe(3);
      expect(paginatedDto.data.length).toBe(10);
    });

    it('should reflect correct pagination for last page', () => {
      const paginatedDto = new PaginatedTransfersResponseDto({
        data: Array(5).fill(mockTransfer1),
        meta: {
          total: 45,
          page: 5,
          limit: 10,
          totalPages: 5,
        },
      });

      expect(paginatedDto.meta.page).toBe(5);
      expect(paginatedDto.data.length).toBe(5);
    });
  });
});

