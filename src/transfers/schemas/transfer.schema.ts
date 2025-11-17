import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransferDocument = Transfer & Document;

@Schema({ timestamps: true, collection: 'transfers' })
export class Transfer {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Company', index: true })
  companyId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  debitAccount: string;

  @Prop({ required: true })
  creditAccount: string;

  @Prop({ required: true, index: true })
  transferDate: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const TransferSchema = SchemaFactory.createForClass(Transfer);

// Indexes for better query performance
TransferSchema.index({ transferDate: -1 });
TransferSchema.index({ companyId: 1, transferDate: -1 });


