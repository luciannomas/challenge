import { ApiProperty } from '@nestjs/swagger';
import { CompanyType } from '../../common/types/company.types';

export class CompanyAdhesionResponseDto {
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

  constructor(partial: Partial<CompanyAdhesionResponseDto>) {
    Object.assign(this, partial);
  }
}

