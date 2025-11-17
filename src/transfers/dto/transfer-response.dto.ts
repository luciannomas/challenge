export class TransferResponseDto {
  id: string;
  companyId: string;
  amount: number;
  debitAccount: string;
  creditAccount: string;
  transferDate: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<TransferResponseDto>) {
    Object.assign(this, partial);
  }
}


