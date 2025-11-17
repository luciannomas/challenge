import { CompanyType } from '../types/company.types';

export interface ICompany {
  cuit: string;
  businessName: string;
  companyType: CompanyType;
  adhesionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}


