import { ApiProperty } from '@nestjs/swagger';
import { CompanyJoinedResponseDto } from './company-joined-response.dto';

class PaginationMeta {
  @ApiProperty({ description: 'Total number of records', example: 8 })
  total: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Records per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of pages', example: 1 })
  totalPages: number;
}

export class PaginatedCompaniesJoinedResponseDto {
  @ApiProperty({
    description: 'Array of companies that joined last month',
    type: [CompanyJoinedResponseDto],
  })
  data: CompanyJoinedResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMeta,
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(partial: Partial<PaginatedCompaniesJoinedResponseDto>) {
    Object.assign(this, partial);
  }
}

