import { validate } from 'class-validator';
import { CreateTransferDto } from '../../../src/transfers/dto/create-transfer.dto';

describe('CreateTransferDto', () => {
  describe('Valid DTO', () => {
    it('should validate successfully with all valid fields', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = 50000.75;
      dto.debitAccount = '1234567890123456';
      dto.creditAccount = '6543210987654321';
      dto.transferDate = '2025-11-14';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept ISO date format', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = 1000;
      dto.debitAccount = '1234567890123456';
      dto.creditAccount = '6543210987654321';
      dto.transferDate = '2025-11-14T10:30:00.000Z';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept large amounts', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = 9999999.99;
      dto.debitAccount = '1234567890123456';
      dto.creditAccount = '6543210987654321';
      dto.transferDate = '2025-11-14';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept small amounts', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = 0.01;
      dto.debitAccount = '1234567890123456';
      dto.creditAccount = '6543210987654321';
      dto.transferDate = '2025-11-14';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept long account numbers', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = 1000;
      dto.debitAccount = '12345678901234567890';
      dto.creditAccount = '09876543210987654321';
      dto.transferDate = '2025-11-14';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('CompanyId Validation', () => {
    it('should reject empty companyId', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '';
      dto.amount = 1000;
      dto.debitAccount = '1234567890123456';
      dto.creditAccount = '6543210987654321';
      dto.transferDate = '2025-11-14';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('companyId');
    });

    it('should reject missing companyId', async () => {
      const dto = new CreateTransferDto();
      dto.amount = 1000;
      dto.debitAccount = '1234567890123456';
      dto.creditAccount = '6543210987654321';
      dto.transferDate = '2025-11-14';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const companyIdError = errors.find((e) => e.property === 'companyId');
      expect(companyIdError).toBeDefined();
    });

    it('should reject non-string companyId', async () => {
      const dto = new CreateTransferDto();
      (dto as any).companyId = 123456;
      dto.amount = 1000;
      dto.debitAccount = '1234567890123456';
      dto.creditAccount = '6543210987654321';
      dto.transferDate = '2025-11-14';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const companyIdError = errors.find((e) => e.property === 'companyId');
      expect(companyIdError).toBeDefined();
    });
  });

  describe('Amount Validation', () => {
    it('should reject missing amount', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.debitAccount = '1234567890123456';
      dto.creditAccount = '6543210987654321';
      dto.transferDate = '2025-11-14';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const amountError = errors.find((e) => e.property === 'amount');
      expect(amountError).toBeDefined();
    });

    it('should reject negative amount', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = -1000;
      dto.debitAccount = '1234567890123456';
      dto.creditAccount = '6543210987654321';
      dto.transferDate = '2025-11-14';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const amountError = errors.find((e) => e.property === 'amount');
      expect(amountError).toBeDefined();
    });

    it('should reject zero amount', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = 0;
      dto.debitAccount = '1234567890123456';
      dto.creditAccount = '6543210987654321';
      dto.transferDate = '2025-11-14';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const amountError = errors.find((e) => e.property === 'amount');
      expect(amountError).toBeDefined();
    });

    it('should reject non-number amount', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      (dto as any).amount = '1000';
      dto.debitAccount = '1234567890123456';
      dto.creditAccount = '6543210987654321';
      dto.transferDate = '2025-11-14';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const amountError = errors.find((e) => e.property === 'amount');
      expect(amountError).toBeDefined();
    });
  });

  describe('DebitAccount Validation', () => {
    it('should reject empty debitAccount', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = 1000;
      dto.debitAccount = '';
      dto.creditAccount = '6543210987654321';
      dto.transferDate = '2025-11-14';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('debitAccount');
    });

    it('should reject missing debitAccount', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = 1000;
      dto.creditAccount = '6543210987654321';
      dto.transferDate = '2025-11-14';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const debitAccountError = errors.find((e) => e.property === 'debitAccount');
      expect(debitAccountError).toBeDefined();
    });

    it('should reject non-string debitAccount', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = 1000;
      (dto as any).debitAccount = 1234567890123456;
      dto.creditAccount = '6543210987654321';
      dto.transferDate = '2025-11-14';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const debitAccountError = errors.find((e) => e.property === 'debitAccount');
      expect(debitAccountError).toBeDefined();
    });
  });

  describe('CreditAccount Validation', () => {
    it('should reject empty creditAccount', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = 1000;
      dto.debitAccount = '1234567890123456';
      dto.creditAccount = '';
      dto.transferDate = '2025-11-14';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('creditAccount');
    });

    it('should reject missing creditAccount', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = 1000;
      dto.debitAccount = '1234567890123456';
      dto.transferDate = '2025-11-14';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const creditAccountError = errors.find((e) => e.property === 'creditAccount');
      expect(creditAccountError).toBeDefined();
    });

    it('should reject non-string creditAccount', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = 1000;
      dto.debitAccount = '1234567890123456';
      (dto as any).creditAccount = 6543210987654321;
      dto.transferDate = '2025-11-14';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const creditAccountError = errors.find((e) => e.property === 'creditAccount');
      expect(creditAccountError).toBeDefined();
    });
  });

  describe('TransferDate Validation', () => {
    it('should reject missing transferDate', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = 1000;
      dto.debitAccount = '1234567890123456';
      dto.creditAccount = '6543210987654321';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const transferDateError = errors.find((e) => e.property === 'transferDate');
      expect(transferDateError).toBeDefined();
    });

    it('should reject empty transferDate', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = 1000;
      dto.debitAccount = '1234567890123456';
      dto.creditAccount = '6543210987654321';
      dto.transferDate = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const transferDateError = errors.find((e) => e.property === 'transferDate');
      expect(transferDateError).toBeDefined();
    });

    it('should reject invalid date format (DD/MM/YYYY)', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = 1000;
      dto.debitAccount = '1234567890123456';
      dto.creditAccount = '6543210987654321';
      dto.transferDate = '14/11/2025';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const transferDateError = errors.find((e) => e.property === 'transferDate');
      expect(transferDateError).toBeDefined();
    });

    it('should reject invalid date format (MM/DD/YYYY)', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = 1000;
      dto.debitAccount = '1234567890123456';
      dto.creditAccount = '6543210987654321';
      dto.transferDate = '11/14/2025';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const transferDateError = errors.find((e) => e.property === 'transferDate');
      expect(transferDateError).toBeDefined();
    });

    it('should reject invalid date string', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = 1000;
      dto.debitAccount = '1234567890123456';
      dto.creditAccount = '6543210987654321';
      dto.transferDate = 'invalid-date';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const transferDateError = errors.find((e) => e.property === 'transferDate');
      expect(transferDateError).toBeDefined();
    });

    it('should accept future dates', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = 1000;
      dto.debitAccount = '1234567890123456';
      dto.creditAccount = '6543210987654321';
      dto.transferDate = '2026-12-31';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept past dates', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = 1000;
      dto.debitAccount = '1234567890123456';
      dto.creditAccount = '6543210987654321';
      dto.transferDate = '2020-01-01';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Multiple Field Validation', () => {
    it('should report all missing required fields', async () => {
      const dto = new CreateTransferDto();

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const errorProperties = errors.map((e) => e.property);
      expect(errorProperties).toContain('companyId');
      expect(errorProperties).toContain('amount');
      expect(errorProperties).toContain('debitAccount');
      expect(errorProperties).toContain('creditAccount');
      expect(errorProperties).toContain('transferDate');
    });

    it('should report multiple validation errors', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '';
      dto.amount = -100;
      dto.debitAccount = '';
      dto.creditAccount = '';
      dto.transferDate = 'invalid';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle decimal amounts correctly', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = 1234.56;
      dto.debitAccount = '1234567890123456';
      dto.creditAccount = '6543210987654321';
      dto.transferDate = '2025-11-14';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle very precise decimal amounts', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = 999.999;
      dto.debitAccount = '1234567890123456';
      dto.creditAccount = '6543210987654321';
      dto.transferDate = '2025-11-14';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should handle minimum positive amount', async () => {
      const dto = new CreateTransferDto();
      dto.companyId = '507f1f77bcf86cd799439011';
      dto.amount = 0.000001;
      dto.debitAccount = '1234567890123456';
      dto.creditAccount = '6543210987654321';
      dto.transferDate = '2025-11-14';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});

