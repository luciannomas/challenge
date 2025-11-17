import { IsString, IsNotEmpty, IsNumber, IsPositive, IsDateString } from 'class-validator';

export class CreateTransferDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  debitAccount: string;

  @IsString()
  @IsNotEmpty()
  creditAccount: string;

  @IsDateString()
  @IsNotEmpty()
  transferDate: string;
}


