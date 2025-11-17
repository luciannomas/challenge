import { ITransfer } from '../../../src/common/interfaces/transfer.interface';

describe('ITransfer Interface', () => {
  describe('Interface Structure', () => {
    it('should create object with all required properties', () => {
      const transfer: ITransfer = {
        companyId: '507f1f77bcf86cd799439011',
        amount: 50000.75,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date('2025-11-14'),
        createdAt: new Date('2025-11-14T00:00:00.000Z'),
        updatedAt: new Date('2025-11-14T00:00:00.000Z'),
      };

      expect(transfer).toBeDefined();
      expect(transfer.companyId).toBe('507f1f77bcf86cd799439011');
      expect(transfer.amount).toBe(50000.75);
      expect(transfer.debitAccount).toBe('1234567890123456');
      expect(transfer.creditAccount).toBe('6543210987654321');
      expect(transfer.transferDate).toBeInstanceOf(Date);
      expect(transfer.createdAt).toBeInstanceOf(Date);
      expect(transfer.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle large amounts', () => {
      const transfer: ITransfer = {
        companyId: '507f1f77bcf86cd799439011',
        amount: 9999999.99,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(transfer.amount).toBe(9999999.99);
    });

    it('should handle small amounts', () => {
      const transfer: ITransfer = {
        companyId: '507f1f77bcf86cd799439011',
        amount: 0.01,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(transfer.amount).toBe(0.01);
    });
  });

  describe('Property Types', () => {
    it('should have companyId as string', () => {
      const transfer: ITransfer = {
        companyId: '507f1f77bcf86cd799439011',
        amount: 1000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(typeof transfer.companyId).toBe('string');
    });

    it('should have amount as number', () => {
      const transfer: ITransfer = {
        companyId: '507f1f77bcf86cd799439011',
        amount: 50000.75,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(typeof transfer.amount).toBe('number');
    });

    it('should have debitAccount as string', () => {
      const transfer: ITransfer = {
        companyId: '507f1f77bcf86cd799439011',
        amount: 1000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(typeof transfer.debitAccount).toBe('string');
    });

    it('should have creditAccount as string', () => {
      const transfer: ITransfer = {
        companyId: '507f1f77bcf86cd799439011',
        amount: 1000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(typeof transfer.creditAccount).toBe('string');
    });

    it('should have transferDate as Date', () => {
      const transfer: ITransfer = {
        companyId: '507f1f77bcf86cd799439011',
        amount: 1000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date('2025-11-14'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(transfer.transferDate).toBeInstanceOf(Date);
    });

    it('should have createdAt as Date', () => {
      const transfer: ITransfer = {
        companyId: '507f1f77bcf86cd799439011',
        amount: 1000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date('2025-11-14T00:00:00.000Z'),
        updatedAt: new Date(),
      };

      expect(transfer.createdAt).toBeInstanceOf(Date);
    });

    it('should have updatedAt as Date', () => {
      const transfer: ITransfer = {
        companyId: '507f1f77bcf86cd799439011',
        amount: 1000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date('2025-11-14T12:00:00.000Z'),
      };

      expect(transfer.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Interface Usage', () => {
    it('should work in functions', () => {
      const getTransferInfo = (transfer: ITransfer): string => {
        return `Transfer of $${transfer.amount} from ${transfer.debitAccount} to ${transfer.creditAccount}`;
      };

      const transfer: ITransfer = {
        companyId: '507f1f77bcf86cd799439011',
        amount: 50000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(getTransferInfo(transfer)).toContain('50000');
    });

    it('should work in arrays', () => {
      const transfers: ITransfer[] = [
        {
          companyId: '507f1f77bcf86cd799439011',
          amount: 1000,
          debitAccount: '1111111111111111',
          creditAccount: '2222222222222222',
          transferDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          companyId: '507f1f77bcf86cd799439012',
          amount: 2000,
          debitAccount: '3333333333333333',
          creditAccount: '4444444444444444',
          transferDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      expect(transfers).toHaveLength(2);
      expect(transfers[0].amount).toBe(1000);
      expect(transfers[1].amount).toBe(2000);
    });

    it('should allow partial updates', () => {
      const updateTransfer = (transfer: ITransfer, updates: Partial<ITransfer>): ITransfer => {
        return { ...transfer, ...updates };
      };

      const transfer: ITransfer = {
        companyId: '507f1f77bcf86cd799439011',
        amount: 1000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date('2025-11-14T00:00:00.000Z'),
      };

      const updated = updateTransfer(transfer, { amount: 2000 });
      expect(updated.amount).toBe(2000);
      expect(updated.companyId).toBe('507f1f77bcf86cd799439011');
    });

    it('should handle decimal amounts', () => {
      const transfer: ITransfer = {
        companyId: '507f1f77bcf86cd799439011',
        amount: 1234.5678,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(transfer.amount).toBe(1234.5678);
    });

    it('should handle long account numbers', () => {
      const transfer: ITransfer = {
        companyId: '507f1f77bcf86cd799439011',
        amount: 1000,
        debitAccount: '12345678901234567890',
        creditAccount: '09876543210987654321',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(transfer.debitAccount).toBe('12345678901234567890');
      expect(transfer.creditAccount).toBe('09876543210987654321');
    });
  });
});

