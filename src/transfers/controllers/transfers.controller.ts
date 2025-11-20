import { Controller, Get, Post, Body, HttpCode, HttpStatus, Logger, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { TransfersService } from '../services/transfers.service';
import { CreateTransferDto } from '../dto/create-transfer.dto';
import { TransferResponseDto } from '../dto/transfer-response.dto';
import { TimezoneInterceptor } from '../../common/interceptors/timezone.interceptor';
import { ErrorExamples } from '../../common/dto/error-response.dto';

@ApiTags('Transfers')
@Controller('transfers')
@UseInterceptors(TimezoneInterceptor)
export class TransfersController {
  private readonly logger = new Logger(TransfersController.name);

  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new transfer',
    description: 'Registers a new bank transfer for a company.',
  })
  @ApiBody({ type: CreateTransferDto })
  @ApiResponse({
    status: 201,
    description: 'Transfer successfully created',
    type: TransferResponseDto,
    example: {
      id: '691659ca75073179dfe1d7db',
      companyId: '691659ca75073179dfe1d7da',
      amount: 150000.50,
      transferDate: '2024-11-20T00:00:00-03:00',
      debitAccount: '1234567890123456',
      creditAccount: '6543210987654321',
      createdAt: '2024-11-20T18:30:00-03:00',
    },
  })
  @ApiResponse({ status: 400, ...ErrorExamples.BadRequest })
  @ApiResponse({ status: 404, ...ErrorExamples.NotFound })
  @ApiResponse({ status: 500, ...ErrorExamples.InternalServerError })
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
  @ApiOperation({
    summary: 'Get transfers from last month',
    description: 'Returns all bank transfers made in the last month.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved transfers',
    type: [TransferResponseDto],
    example: [
      {
        id: '691659ca75073179dfe1d7db',
        companyId: '691659ca75073179dfe1d7da',
        amount: 150000.50,
        transferDate: '2024-11-20T00:00:00-03:00',
        debitAccount: '1234567890123456',
        creditAccount: '6543210987654321',
        createdAt: '2024-11-20T18:30:00-03:00',
      },
    ],
  })
  @ApiResponse({ status: 500, ...ErrorExamples.InternalServerError })
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


