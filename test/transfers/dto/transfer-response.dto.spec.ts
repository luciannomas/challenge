import { TransferResponseDto } from '../../../src/transfers/dto/transfer-response.dto';

describe('TransferResponseDto', () => {
  describe('Constructor', () => {
    it('should create instance with all properties', () => {
      const data = {
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 50000.75,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date('2025-11-14'),
        createdAt: new Date('2025-11-14T00:00:00.000Z'),
        updatedAt: new Date('2025-11-14T00:00:00.000Z'),
      };

      const dto = new TransferResponseDto(data);

      expect(dto.id).toBe(data.id);
      expect(dto.companyId).toBe(data.companyId);
      expect(dto.amount).toBe(data.amount);
      expect(dto.debitAccount).toBe(data.debitAccount);
      expect(dto.creditAccount).toBe(data.creditAccount);
      expect(dto.transferDate).toEqual(data.transferDate);
      expect(dto.createdAt).toEqual(data.createdAt);
      expect(dto.updatedAt).toEqual(data.updatedAt);
    });

    it('should create instance with partial properties', () => {
      const data = {
        id: '507f1f77bcf86cd799439012',
        amount: 1000,
      };

      const dto = new TransferResponseDto(data);

      expect(dto.id).toBe(data.id);
      expect(dto.amount).toBe(data.amount);
      expect(dto.companyId).toBeUndefined();
      expect(dto.debitAccount).toBeUndefined();
    });

    it('should handle empty object', () => {
      const dto = new TransferResponseDto({});

      expect(dto).toBeDefined();
      expect(dto.id).toBeUndefined();
      expect(dto.companyId).toBeUndefined();
      expect(dto.amount).toBeUndefined();
    });
  });

  describe('Properties', () => {
    it('should have all required properties', () => {
      const dto = new TransferResponseDto({
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 50000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(dto).toHaveProperty('id');
      expect(dto).toHaveProperty('companyId');
      expect(dto).toHaveProperty('amount');
      expect(dto).toHaveProperty('debitAccount');
      expect(dto).toHaveProperty('creditAccount');
      expect(dto).toHaveProperty('transferDate');
      expect(dto).toHaveProperty('createdAt');
      expect(dto).toHaveProperty('updatedAt');
    });

    it('should have correct property types', () => {
      const dto = new TransferResponseDto({
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 50000.75,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date('2025-11-14'),
        createdAt: new Date('2025-11-14T00:00:00.000Z'),
        updatedAt: new Date('2025-11-14T00:00:00.000Z'),
      });

      expect(typeof dto.id).toBe('string');
      expect(typeof dto.companyId).toBe('string');
      expect(typeof dto.amount).toBe('number');
      expect(typeof dto.debitAccount).toBe('string');
      expect(typeof dto.creditAccount).toBe('string');
      expect(dto.transferDate).toBeInstanceOf(Date);
      expect(dto.createdAt).toBeInstanceOf(Date);
      expect(dto.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Amount Handling', () => {
    it('should handle large amounts', () => {
      const dto = new TransferResponseDto({
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 9999999.99,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(dto.amount).toBe(9999999.99);
    });

    it('should handle small amounts', () => {
      const dto = new TransferResponseDto({
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 0.01,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(dto.amount).toBe(0.01);
    });

    it('should handle integer amounts', () => {
      const dto = new TransferResponseDto({
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 5000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(dto.amount).toBe(5000);
    });

    it('should preserve decimal precision', () => {
      const dto = new TransferResponseDto({
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 1234.5678,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(dto.amount).toBe(1234.5678);
    });
  });

  describe('Account Numbers', () => {
    it('should handle standard account numbers', () => {
      const dto = new TransferResponseDto({
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 1000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(dto.debitAccount).toBe('1234567890123456');
      expect(dto.creditAccount).toBe('6543210987654321');
    });

    it('should handle long account numbers', () => {
      const dto = new TransferResponseDto({
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 1000,
        debitAccount: '12345678901234567890',
        creditAccount: '09876543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(dto.debitAccount).toBe('12345678901234567890');
      expect(dto.creditAccount).toBe('09876543210987654321');
    });

    it('should handle short account numbers', () => {
      const dto = new TransferResponseDto({
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 1000,
        debitAccount: '123456',
        creditAccount: '654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(dto.debitAccount).toBe('123456');
      expect(dto.creditAccount).toBe('654321');
    });
  });

  describe('Date Handling', () => {
    it('should handle transferDate correctly', () => {
      const transferDate = new Date('2025-11-14T10:30:00.000Z');
      const dto = new TransferResponseDto({
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 1000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: transferDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(dto.transferDate).toEqual(transferDate);
    });

    it('should handle createdAt correctly', () => {
      const createdAt = new Date('2025-11-14T00:00:00.000Z');
      const dto = new TransferResponseDto({
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 1000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: createdAt,
        updatedAt: new Date(),
      });

      expect(dto.createdAt).toEqual(createdAt);
    });

    it('should handle updatedAt correctly', () => {
      const updatedAt = new Date('2025-11-14T12:00:00.000Z');
      const dto = new TransferResponseDto({
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 1000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: updatedAt,
      });

      expect(dto.updatedAt).toEqual(updatedAt);
    });

    it('should handle different date formats', () => {
      const dto = new TransferResponseDto({
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 1000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date('2025-11-14'),
        createdAt: new Date('2025-11-14T00:00:00.000Z'),
        updatedAt: new Date('2025-11-14T12:30:45.123Z'),
      });

      expect(dto.transferDate).toBeInstanceOf(Date);
      expect(dto.createdAt).toBeInstanceOf(Date);
      expect(dto.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('ID Handling', () => {
    it('should handle MongoDB ObjectId format', () => {
      const dto = new TransferResponseDto({
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 1000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(dto.id).toBe('507f1f77bcf86cd799439012');
      expect(dto.id.length).toBe(24);
    });

    it('should handle companyId as string', () => {
      const dto = new TransferResponseDto({
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 1000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(typeof dto.companyId).toBe('string');
      expect(dto.companyId).toBe('507f1f77bcf86cd799439011');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero amount', () => {
      const dto = new TransferResponseDto({
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 0,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(dto.amount).toBe(0);
    });

    it('should handle same debit and credit accounts', () => {
      const dto = new TransferResponseDto({
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 1000,
        debitAccount: '1234567890123456',
        creditAccount: '1234567890123456',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(dto.debitAccount).toBe(dto.creditAccount);
    });

    it('should handle same createdAt and updatedAt', () => {
      const now = new Date('2025-11-14T12:00:00.000Z');
      const dto = new TransferResponseDto({
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 1000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: now,
        updatedAt: now,
      });

      expect(dto.createdAt).toEqual(dto.updatedAt);
    });

    it('should create DTO from another DTO', () => {
      const originalDto = new TransferResponseDto({
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 1000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date('2025-11-14'),
        createdAt: new Date('2025-11-14T00:00:00.000Z'),
        updatedAt: new Date('2025-11-14T00:00:00.000Z'),
      });

      const copiedDto = new TransferResponseDto(originalDto);

      expect(copiedDto.id).toBe(originalDto.id);
      expect(copiedDto.companyId).toBe(originalDto.companyId);
      expect(copiedDto.amount).toBe(originalDto.amount);
      expect(copiedDto.debitAccount).toBe(originalDto.debitAccount);
      expect(copiedDto.creditAccount).toBe(originalDto.creditAccount);
      expect(copiedDto.transferDate).toEqual(originalDto.transferDate);
    });
  });

  describe('Object Structure', () => {
    it('should only have expected properties when fully populated', () => {
      const dto = new TransferResponseDto({
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 1000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const keys = Object.keys(dto);
      expect(keys).toHaveLength(8);
      expect(keys).toContain('id');
      expect(keys).toContain('companyId');
      expect(keys).toContain('amount');
      expect(keys).toContain('debitAccount');
      expect(keys).toContain('creditAccount');
      expect(keys).toContain('transferDate');
      expect(keys).toContain('createdAt');
      expect(keys).toContain('updatedAt');
    });

    it('should not add extra properties', () => {
      const dto = new TransferResponseDto({
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 1000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(dto).not.toHaveProperty('extraField');
    });
  });
});

