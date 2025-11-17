import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CompanyType } from '../../common/types/company.types';

export type CompanyDocument = Company & Document;

@Schema({ timestamps: true, collection: 'companies' })
export class Company {
  @Prop({ required: true, unique: true, index: true })
  cuit: string;

  @Prop({ required: true })
  businessName: string;

  @Prop({ required: true, enum: Object.values(CompanyType) })
  companyType: CompanyType;

  @Prop({ required: true, index: true })
  adhesionDate: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

// Indexes for better query performance
CompanySchema.index({ adhesionDate: -1 });


