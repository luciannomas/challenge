import { ApiProperty } from '@nestjs/swagger';
import { TransferWithCompanyDto } from './company-with-transfers.dto';

class TransfersPaginationMeta {
  @ApiProperty({ description: 'Total number of transfers', example: 25 })
  total: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Transfers per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of pages', example: 3 })
  totalPages: number;
}

export class PaginatedTransfersResponseDto {
  @ApiProperty({
    description: 'Array of transfers from companies in last month',
    type: [TransferWithCompanyDto],
  })
  data: TransferWithCompanyDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: TransfersPaginationMeta,
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(partial: Partial<PaginatedTransfersResponseDto>) {
    Object.assign(this, partial);
  }
}

