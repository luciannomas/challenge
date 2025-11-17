import { IsString, IsEnum, IsNotEmpty, Matches, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CompanyType } from '../../common/types/company.types';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'CUIT (Tax ID) - must be exactly 11 digits',
    example: '20333444555',
    pattern: '^\\d{11}$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{11}$/, { message: 'CUIT must be 11 digits' })
  cuit: string;

  @ApiProperty({
    description: 'Business name of the company',
    example: 'Tech Solutions SA',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Business name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Business name must not exceed 100 characters' })
  businessName: string;

  @ApiProperty({
    description: 'Type of company',
    enum: CompanyType,
    example: CompanyType.SME,
  })
  @IsEnum(CompanyType)
  @IsNotEmpty()
  companyType: CompanyType;

  @ApiProperty({
    description: 'Adhesion date in format YYYY-MM-DD',
    example: '2025-11-14',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { 
    message: 'Adhesion date must be in format YYYY-MM-DD (e.g., 2025-11-13)' 
  })
  adhesionDate: string;
}


