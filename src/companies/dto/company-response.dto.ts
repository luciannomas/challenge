import { ApiProperty } from '@nestjs/swagger';
import { CompanyType } from '../../common/types/company.types';

export class CompanyResponseDto {
  @ApiProperty({
    description: 'Company unique identifier',
    example: '691659ca75073179dfe1d7da',
  })
  id: string;

  @ApiProperty({
    description: 'CUIT (Tax ID)',
    example: '20333444555',
  })
  cuit: string;

  @ApiProperty({
    description: 'Business name',
    example: 'Tech Solutions SA',
  })
  businessName: string;

  @ApiProperty({
    description: 'Type of company',
    enum: CompanyType,
    example: CompanyType.SME,
  })
  companyType: CompanyType;

  @ApiProperty({
    description: 'Date when company joined (UTC-3 timezone)',
    example: '2025-11-14T18:30:00-03:00',
  })
  adhesionDate: Date;

  @ApiProperty({
    description: 'Record creation timestamp (UTC-3 timezone)',
    example: '2025-11-14T18:30:00-03:00',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Record last update timestamp (UTC-3 timezone)',
    example: '2025-11-14T18:30:00-03:00',
  })
  updatedAt: Date;

  constructor(partial: Partial<CompanyResponseDto>) {
    Object.assign(this, partial);
  }
}


