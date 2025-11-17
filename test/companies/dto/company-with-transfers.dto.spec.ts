import { TransferWithCompanyDto } from '../../../src/companies/dto/company-with-transfers.dto';

describe('TransferWithCompanyDto', () => {
  describe('Constructor', () => {
    it('should create instance with all properties', () => {
      const data = {
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 150000.50,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
      };

      const dto = new TransferWithCompanyDto(data);

      expect(dto.id).toBe(data.id);
      expect(dto.companyId).toBe(data.companyId);
      expect(dto.amount).toBe(data.amount);
      expect(dto.debitAccount).toBe(data.debitAccount);
      expect(dto.creditAccount).toBe(data.creditAccount);
    });

    it('should create instance with partial properties', () => {
      const data = {
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
      };

      const dto = new TransferWithCompanyDto(data);

      expect(dto.id).toBe(data.id);
      expect(dto.companyId).toBe(data.companyId);
      expect(dto.amount).toBeUndefined();
      expect(dto.debitAccount).toBeUndefined();
      expect(dto.creditAccount).toBeUndefined();
    });

    it('should only include expected properties when filtering', () => {
      const data: any = {
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 150000.50,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
      };

      const dto = new TransferWithCompanyDto(data);

      // Verify expected properties exist
      expect(dto).toHaveProperty('id');
      expect(dto).toHaveProperty('companyId');
      expect(dto).toHaveProperty('amount');
      expect(dto).toHaveProperty('debitAccount');
      expect(dto).toHaveProperty('creditAccount');
      
      // Verify only 5 properties are present
      expect(Object.keys(dto).length).toBe(5);
    });

    it('should handle different amount values', () => {
      const testCases = [
        { amount: 0, expected: 0 },
        { amount: 100.50, expected: 100.50 },
        { amount: 1000000, expected: 1000000 },
        { amount: 0.01, expected: 0.01 },
      ];

      testCases.forEach(({ amount, expected }) => {
        const dto = new TransferWithCompanyDto({
          id: '507f1f77bcf86cd799439012',
          companyId: '507f1f77bcf86cd799439011',
          amount,
          debitAccount: '1234567890123456',
          creditAccount: '6543210987654321',
        });

        expect(dto.amount).toBe(expected);
      });
    });

    it('should handle long account numbers', () => {
      const data = {
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 150000.50,
        debitAccount: '12345678901234567890',
        creditAccount: '09876543210987654321',
      };

      const dto = new TransferWithCompanyDto(data);

      expect(dto.debitAccount).toBe(data.debitAccount);
      expect(dto.creditAccount).toBe(data.creditAccount);
    });
  });

  describe('Properties', () => {
    it('should have correct property types', () => {
      const dto = new TransferWithCompanyDto({
        id: '507f1f77bcf86cd799439012',
        companyId: '507f1f77bcf86cd799439011',
        amount: 150000.50,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
      });

      expect(typeof dto.id).toBe('string');
      expect(typeof dto.companyId).toBe('string');
      expect(typeof dto.amount).toBe('number');
      expect(typeof dto.debitAccount).toBe('string');
      expect(typeof dto.creditAccount).toBe('string');
    });
  });
});

