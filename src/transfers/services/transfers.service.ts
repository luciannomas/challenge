import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transfer, TransferDocument } from '../schemas/transfer.schema';
import { CreateTransferDto } from '../dto/create-transfer.dto';
import { TransferResponseDto } from '../dto/transfer-response.dto';

@Injectable()
export class TransfersService {
  private readonly logger = new Logger(TransfersService.name);

  constructor(
    @InjectModel(Transfer.name) private transferModel: Model<TransferDocument>,
  ) {}

  async createTransfer(createTransferDto: CreateTransferDto): Promise<TransferResponseDto> {
    this.logger.log(`[Transfers-Service]: Creating new transfer for company ${createTransferDto.companyId}`);

    try {
      const newTransfer = new this.transferModel({
        ...createTransferDto,
        transferDate: new Date(createTransferDto.transferDate),
      });

      const savedTransfer = await newTransfer.save();
      
      this.logger.log(`[Transfers-Service]: Transfer created successfully with ID ${savedTransfer._id}`);

      return new TransferResponseDto({
        id: savedTransfer._id.toString(),
        companyId: savedTransfer.companyId.toString(),
        amount: savedTransfer.amount,
        debitAccount: savedTransfer.debitAccount,
        creditAccount: savedTransfer.creditAccount,
        transferDate: savedTransfer.transferDate,
        createdAt: savedTransfer.createdAt,
        updatedAt: savedTransfer.updatedAt,
      });
    } catch (error) {
      this.logger.error(`[Transfers-Service]: Error creating transfer - ${error.message}`);
      throw error;
    }
  }

  async getTransfersLastMonth(): Promise<TransferResponseDto[]> {
    this.logger.log('[Transfers-Service]: Fetching transfers from last month');

    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      this.logger.log(`[Transfers-Service]: Searching for transfers since ${oneMonthAgo.toISOString()}`);

      const transfers = await this.transferModel
        .find({ transferDate: { $gte: oneMonthAgo } })
        .sort({ transferDate: -1 })
        .exec();

      this.logger.log(`[Transfers-Service]: Found ${transfers.length} transfers in the last month`);

      return transfers.map(transfer => new TransferResponseDto({
        id: transfer._id.toString(),
        companyId: transfer.companyId.toString(),
        amount: transfer.amount,
        debitAccount: transfer.debitAccount,
        creditAccount: transfer.creditAccount,
        transferDate: transfer.transferDate,
        createdAt: transfer.createdAt,
        updatedAt: transfer.updatedAt,
      }));
    } catch (error) {
      this.logger.error(`[Transfers-Service]: Error fetching transfers from last month - ${error.message}`);
      throw error;
    }
  }
}


