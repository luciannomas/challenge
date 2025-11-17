import { ApiProperty } from '@nestjs/swagger';

export class TransferWithCompanyDto {
  @ApiProperty({
    description: 'Transfer unique identifier',
    example: '691659ca75073179dfe1d7db',
  })
  id: string;

  @ApiProperty({
    description: 'Company ID that made the transfer',
    example: '691659ca75073179dfe1d7da',
  })
  companyId: string;

  @ApiProperty({
    description: 'Transfer amount in ARS',
    example: 150000.50,
  })
  amount: number;

  @ApiProperty({
    description: 'Debit account number',
    example: '1234567890123456',
  })
  debitAccount: string;

  @ApiProperty({
    description: 'Credit account number',
    example: '6543210987654321',
  })
  creditAccount: string;

  constructor(partial: Partial<TransferWithCompanyDto>) {
    Object.assign(this, partial);
  }
}


