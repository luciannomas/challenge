import { CompanyResponseDto } from './company-response.dto';

export class PaginatedCompaniesResponseDto {
  data: CompanyResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(partial: Partial<PaginatedCompaniesResponseDto>) {
    Object.assign(this, partial);
  }
}

