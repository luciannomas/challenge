import { Controller, Get, Post, Body, HttpCode, HttpStatus, Logger, UseInterceptors } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { TransfersService } from '../services/transfers.service';
import { CreateTransferDto } from '../dto/create-transfer.dto';
import { TransferResponseDto } from '../dto/transfer-response.dto';
import { TimezoneInterceptor } from '../../common/interceptors/timezone.interceptor';

@ApiExcludeController()
@Controller('transfers')
@UseInterceptors(TimezoneInterceptor)
export class TransfersController {
  private readonly logger = new Logger(TransfersController.name);

  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTransfer(@Body() createTransferDto: CreateTransferDto): Promise<TransferResponseDto> {
    this.logger.log(`[Transfers-Controller]: POST /transfers - Creating new transfer`);
    
    try {
      const result = await this.transfersService.createTransfer(createTransferDto);
      this.logger.log(`[Transfers-Controller]: Transfer created successfully`);
      return result;
    } catch (error) {
      this.logger.error(`[Transfers-Controller]: Error creating transfer - ${error.message}`);
      throw error;
    }
  }

  @Get('last-month')
  @HttpCode(HttpStatus.OK)
  async getTransfersLastMonth(): Promise<TransferResponseDto[]> {
    this.logger.log(`[Transfers-Controller]: GET /transfers/last-month - Fetching transfers from last month`);
    
    try {
      const result = await this.transfersService.getTransfersLastMonth();
      this.logger.log(`[Transfers-Controller]: Retrieved ${result.length} transfers`);
      return result;
    } catch (error) {
      this.logger.error(`[Transfers-Controller]: Error fetching transfers - ${error.message}`);
      throw error;
    }
  }
}


