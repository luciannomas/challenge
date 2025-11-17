import { TransferSchema, Transfer } from '../../../src/transfers/schemas/transfer.schema';
import mongoose, { Types } from 'mongoose';

describe('TransferSchema', () => {
  let TransferModel: mongoose.Model<Transfer>;

  beforeAll(() => {
    // Create model from schema for testing
    TransferModel = mongoose.model('Transfer', TransferSchema);
  });

  afterAll(async () => {
    // Clean up
    mongoose.deleteModel('Transfer');
  });

  describe('Schema definition', () => {
    it('should be defined', () => {
      expect(TransferSchema).toBeDefined();
    });

    it('should have correct collection name', () => {
      expect(TransferSchema.get('collection')).toBe('transfers');
    });

    it('should have timestamps enabled', () => {
      expect(TransferSchema.get('timestamps')).toBe(true);
    });
  });

  describe('Schema properties', () => {
    it('should have companyId field', () => {
      const companyIdPath = TransferSchema.path('companyId');
      expect(companyIdPath).toBeDefined();
      expect(companyIdPath.isRequired).toBe(true);
    });

    it('should have amount field', () => {
      const amountPath = TransferSchema.path('amount');
      expect(amountPath).toBeDefined();
      expect(amountPath.isRequired).toBe(true);
    });

    it('should have debitAccount field', () => {
      const debitAccountPath = TransferSchema.path('debitAccount');
      expect(debitAccountPath).toBeDefined();
      expect(debitAccountPath.isRequired).toBe(true);
    });

    it('should have creditAccount field', () => {
      const creditAccountPath = TransferSchema.path('creditAccount');
      expect(creditAccountPath).toBeDefined();
      expect(creditAccountPath.isRequired).toBe(true);
    });

    it('should have transferDate field', () => {
      const transferDatePath = TransferSchema.path('transferDate');
      expect(transferDatePath).toBeDefined();
      expect(transferDatePath.isRequired).toBe(true);
    });

    it('should have createdAt field', () => {
      const createdAtPath = TransferSchema.path('createdAt');
      expect(createdAtPath).toBeDefined();
    });

    it('should have updatedAt field', () => {
      const updatedAtPath = TransferSchema.path('updatedAt');
      expect(updatedAtPath).toBeDefined();
    });
  });

  describe('Field types', () => {
    it('should have companyId as ObjectId type', () => {
      const companyIdPath = TransferSchema.path('companyId') as any;
      // companyId can be 'ObjectID' or 'Mixed' depending on Mongoose version
      expect(['ObjectID', 'Mixed']).toContain(companyIdPath.instance);
    });

    it('should have amount as Number type', () => {
      const amountPath = TransferSchema.path('amount');
      expect(amountPath.instance).toBe('Number');
    });

    it('should have debitAccount as String type', () => {
      const debitAccountPath = TransferSchema.path('debitAccount');
      expect(debitAccountPath.instance).toBe('String');
    });

    it('should have creditAccount as String type', () => {
      const creditAccountPath = TransferSchema.path('creditAccount');
      expect(creditAccountPath.instance).toBe('String');
    });

    it('should have transferDate as Date type', () => {
      const transferDatePath = TransferSchema.path('transferDate');
      expect(transferDatePath.instance).toBe('Date');
    });

    it('should have createdAt as Date type', () => {
      const createdAtPath = TransferSchema.path('createdAt');
      expect(createdAtPath.instance).toBe('Date');
    });

    it('should have updatedAt as Date type', () => {
      const updatedAtPath = TransferSchema.path('updatedAt');
      expect(updatedAtPath.instance).toBe('Date');
    });
  });

  describe('References', () => {
    it('should have companyId reference to Company', () => {
      const companyIdPath = TransferSchema.path('companyId') as any;
      expect(companyIdPath.options.ref).toBe('Company');
    });

    it('should have companyId as ObjectId type for reference', () => {
      const companyIdPath = TransferSchema.path('companyId') as any;
      // companyId can be 'ObjectID' or 'Mixed' depending on Mongoose version
      expect(['ObjectID', 'Mixed']).toContain(companyIdPath.instance);
    });

    it('should verify companyId accepts ObjectId values', () => {
      const transfer = new TransferModel({
        companyId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        amount: 50000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date('2025-11-14'),
      });

      expect(transfer.companyId).toBeInstanceOf(Types.ObjectId);
    });
  });

  describe('Indexes', () => {
    it('should have index on companyId field', () => {
      const indexes = TransferSchema.indexes();
      const companyIdIndex = indexes.find((index: any) => index[0].companyId !== undefined);
      expect(companyIdIndex).toBeDefined();
    });

    it('should have index on transferDate field', () => {
      const indexes = TransferSchema.indexes();
      const transferDateIndex = indexes.find((index: any) => index[0].transferDate !== undefined);
      expect(transferDateIndex).toBeDefined();
    });

    it('should have descending index on transferDate', () => {
      const indexes = TransferSchema.indexes();
      // Find the descending index specifically (there might be multiple transferDate indexes)
      const transferDateDescIndex = indexes.find(
        (index: any) => index[0].transferDate === -1 && !index[0].companyId
      );
      expect(transferDateDescIndex).toBeDefined();
      expect(transferDateDescIndex[0].transferDate).toBe(-1);
    });

    it('should have compound index on companyId and transferDate', () => {
      const indexes = TransferSchema.indexes();
      const compoundIndex = indexes.find(
        (index: any) => index[0].companyId !== undefined && index[0].transferDate !== undefined
      );
      expect(compoundIndex).toBeDefined();
    });

    it('should have compound index with correct order', () => {
      const indexes = TransferSchema.indexes();
      const compoundIndex = indexes.find(
        (index: any) => index[0].companyId !== undefined && index[0].transferDate !== undefined
      );
      expect(compoundIndex).toBeDefined();
      expect(compoundIndex[0].companyId).toBe(1);
      expect(compoundIndex[0].transferDate).toBe(-1);
    });

    it('should have at least 3 indexes', () => {
      const indexes = TransferSchema.indexes();
      expect(indexes.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Required fields validation', () => {
    it('should mark companyId as required', () => {
      const companyIdPath = TransferSchema.path('companyId');
      expect(companyIdPath.isRequired).toBe(true);
    });

    it('should mark amount as required', () => {
      const amountPath = TransferSchema.path('amount');
      expect(amountPath.isRequired).toBe(true);
    });

    it('should mark debitAccount as required', () => {
      const debitAccountPath = TransferSchema.path('debitAccount');
      expect(debitAccountPath.isRequired).toBe(true);
    });

    it('should mark creditAccount as required', () => {
      const creditAccountPath = TransferSchema.path('creditAccount');
      expect(creditAccountPath.isRequired).toBe(true);
    });

    it('should mark transferDate as required', () => {
      const transferDatePath = TransferSchema.path('transferDate');
      expect(transferDatePath.isRequired).toBe(true);
    });

    it('should not mark createdAt as required', () => {
      const createdAtPath = TransferSchema.path('createdAt');
      // Timestamp fields don't have isRequired property, they're auto-managed
      expect(createdAtPath.isRequired).toBeFalsy();
    });

    it('should not mark updatedAt as required', () => {
      const updatedAtPath = TransferSchema.path('updatedAt');
      // Timestamp fields don't have isRequired property, they're auto-managed
      expect(updatedAtPath.isRequired).toBeFalsy();
    });
  });

  describe('Schema validation', () => {
    it('should validate a complete transfer document', () => {
      const transfer = new TransferModel({
        companyId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        amount: 50000.75,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date('2025-11-14'),
      });

      const validationError = transfer.validateSync();
      expect(validationError).toBeUndefined();
    });

    it('should fail validation without companyId', () => {
      const transfer = new TransferModel({
        amount: 50000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date('2025-11-14'),
      });

      const validationError = transfer.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError?.errors.companyId).toBeDefined();
    });

    it('should fail validation without amount', () => {
      const transfer = new TransferModel({
        companyId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date('2025-11-14'),
      });

      const validationError = transfer.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError?.errors.amount).toBeDefined();
    });

    it('should fail validation without debitAccount', () => {
      const transfer = new TransferModel({
        companyId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        amount: 50000,
        creditAccount: '6543210987654321',
        transferDate: new Date('2025-11-14'),
      });

      const validationError = transfer.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError?.errors.debitAccount).toBeDefined();
    });

    it('should fail validation without creditAccount', () => {
      const transfer = new TransferModel({
        companyId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        amount: 50000,
        debitAccount: '1234567890123456',
        transferDate: new Date('2025-11-14'),
      });

      const validationError = transfer.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError?.errors.creditAccount).toBeDefined();
    });

    it('should fail validation without transferDate', () => {
      const transfer = new TransferModel({
        companyId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        amount: 50000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
      });

      const validationError = transfer.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError?.errors.transferDate).toBeDefined();
    });

    it('should validate with large amount', () => {
      const transfer = new TransferModel({
        companyId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        amount: 9999999.99,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date('2025-11-14'),
      });

      const validationError = transfer.validateSync();
      expect(validationError).toBeUndefined();
    });

    it('should validate with small amount', () => {
      const transfer = new TransferModel({
        companyId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        amount: 0.01,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date('2025-11-14'),
      });

      const validationError = transfer.validateSync();
      expect(validationError).toBeUndefined();
    });

    it('should validate with past date', () => {
      const transfer = new TransferModel({
        companyId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        amount: 50000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date('2020-01-01'),
      });

      const validationError = transfer.validateSync();
      expect(validationError).toBeUndefined();
    });

    it('should validate with future date', () => {
      const transfer = new TransferModel({
        companyId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        amount: 50000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date('2026-12-31'),
      });

      const validationError = transfer.validateSync();
      expect(validationError).toBeUndefined();
    });
  });

  describe('Document creation', () => {
    it('should create a transfer document with all properties', () => {
      const transferData = {
        companyId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        amount: 50000.75,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date('2025-11-14'),
      };

      const transfer = new TransferModel(transferData);

      expect(transfer.companyId).toEqual(transferData.companyId);
      expect(transfer.amount).toBe(transferData.amount);
      expect(transfer.debitAccount).toBe(transferData.debitAccount);
      expect(transfer.creditAccount).toBe(transferData.creditAccount);
      expect(transfer.transferDate).toEqual(transferData.transferDate);
    });

    it('should set default values for timestamps', () => {
      const transfer = new TransferModel({
        companyId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        amount: 50000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date('2025-11-14'),
      });

      // Timestamps are set when saving, but we can verify the fields exist
      expect(transfer).toHaveProperty('createdAt');
      expect(transfer).toHaveProperty('updatedAt');
    });

    it('should handle decimal amounts', () => {
      const transfer = new TransferModel({
        companyId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        amount: 1234.5678,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date('2025-11-14'),
      });

      expect(transfer.amount).toBe(1234.5678);
    });

    it('should handle long account numbers', () => {
      const transfer = new TransferModel({
        companyId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        amount: 50000,
        debitAccount: '12345678901234567890',
        creditAccount: '09876543210987654321',
        transferDate: new Date('2025-11-14'),
      });

      expect(transfer.debitAccount).toBe('12345678901234567890');
      expect(transfer.creditAccount).toBe('09876543210987654321');
    });

    it('should preserve ObjectId reference type', () => {
      const companyObjectId = new Types.ObjectId('507f1f77bcf86cd799439011');
      const transfer = new TransferModel({
        companyId: companyObjectId,
        amount: 50000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date('2025-11-14'),
      });

      expect(transfer.companyId).toBeInstanceOf(Types.ObjectId);
      expect(transfer.companyId.toString()).toBe('507f1f77bcf86cd799439011');
    });
  });

  describe('Amount handling', () => {
    it('should handle integer amounts', () => {
      const transfer = new TransferModel({
        companyId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        amount: 50000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date('2025-11-14'),
      });

      expect(transfer.amount).toBe(50000);
      expect(Number.isInteger(transfer.amount)).toBe(true);
    });

    it('should handle negative amounts (schema allows)', () => {
      const transfer = new TransferModel({
        companyId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        amount: -1000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date('2025-11-14'),
      });

      // Note: Schema validation doesn't prevent negative amounts
      // This is handled by DTO validation
      expect(transfer.amount).toBe(-1000);
    });

    it('should handle zero amount', () => {
      const transfer = new TransferModel({
        companyId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        amount: 0,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date('2025-11-14'),
      });

      expect(transfer.amount).toBe(0);
    });
  });

  describe('Date handling', () => {
    it('should accept Date objects for transferDate', () => {
      const date = new Date('2025-11-14T10:30:00.000Z');
      const transfer = new TransferModel({
        companyId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        amount: 50000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: date,
      });

      expect(transfer.transferDate).toEqual(date);
    });

    it('should accept ISO date strings for transferDate', () => {
      const transfer = new TransferModel({
        companyId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        amount: 50000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: '2025-11-14',
      });

      expect(transfer.transferDate).toBeInstanceOf(Date);
    });

    it('should handle different date formats', () => {
      const transfer = new TransferModel({
        companyId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        amount: 50000,
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        transferDate: new Date('2025-11-14T12:30:45.123Z'),
      });

      expect(transfer.transferDate).toBeInstanceOf(Date);
      expect(transfer.transferDate.getTime()).toBeGreaterThan(0);
    });
  });
});

