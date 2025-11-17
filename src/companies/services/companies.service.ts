import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from 'moment-timezone';
import { Company, CompanyDocument } from '../schemas/company.schema';
import { Transfer, TransferDocument } from '../../transfers/schemas/transfer.schema';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { CompanyResponseDto } from '../dto/company-response.dto';
import { CompanyJoinedResponseDto } from '../dto/company-joined-response.dto';
import { TransferWithCompanyDto } from '../dto/company-with-transfers.dto';
import { TIMEZONE } from '../../common/constants/timezone.constant';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Transfer.name) private transferModel: Model<TransferDocument>,
  ) {}

  async createCompany(createCompanyDto: CreateCompanyDto): Promise<CompanyResponseDto> {
    this.logger.log(`[Companies-Service]: Creating new company with CUIT ${createCompanyDto.cuit}`);

    try {
      const existingCompany = await this.companyModel.findOne({ cuit: createCompanyDto.cuit });

      if (existingCompany) {
        this.logger.warn(`[Companies-Service]: Company with CUIT ${createCompanyDto.cuit} already exists`);
        throw new ConflictException('Company with this CUIT already exists');
      }

      // Parse date in configured timezone (UTC-3) with current time
      const now = moment.tz(TIMEZONE.NAME);
      const adhesionDateInput = moment.tz(createCompanyDto.adhesionDate, TIMEZONE.NAME);
      
      // Set the time to current time (instead of 00:00:00)
      adhesionDateInput.hours(now.hours());
      adhesionDateInput.minutes(now.minutes());
      adhesionDateInput.seconds(now.seconds());
      adhesionDateInput.milliseconds(now.milliseconds());
      
      const adhesionDate = adhesionDateInput.toDate();
      const formattedDate = moment(adhesionDate).tz(TIMEZONE.NAME);
      
      this.logger.log(`[Companies-Service]: Adhesion date set to ${formattedDate.format('DD/MM/YYYY HH:mm:ss')} (${TIMEZONE.DESCRIPTION}${formattedDate.format('Z')})`);

            const newCompany = new this.companyModel({
              ...createCompanyDto,
              adhesionDate: adhesionDate,
            });

      const savedCompany = await newCompany.save();
      
      this.logger.log(`[Companies-Service]: Company created successfully with ID ${savedCompany._id}`);

            return new CompanyResponseDto({
              id: savedCompany._id.toString(),
              cuit: savedCompany.cuit,
              businessName: savedCompany.businessName,
              companyType: savedCompany.companyType,
              adhesionDate: savedCompany.adhesionDate,
              createdAt: savedCompany.createdAt,
              updatedAt: savedCompany.updatedAt,
            });
    } catch (error) {
      this.logger.error(`[Companies-Service]: Error creating company - ${error.message}`);
      throw error;
    }
  }

  async getCompaniesWithTransfersLastMonth(page: number = 1, limit: number = 10): Promise<{ data: TransferWithCompanyDto[], total: number }> {
    this.logger.log(`[Companies-Service]: Fetching transfers from last month (page: ${page}, limit: ${limit})`);

    try {
      // Calculate one month ago in configured timezone (UTC-3)
      const oneMonthAgo = moment.tz(TIMEZONE.NAME).subtract(1, 'month').toDate();

      this.logger.log(`[Companies-Service]: Searching for transfers since ${oneMonthAgo.toISOString()}`);

      // Get total count
      const total = await this.transferModel
        .countDocuments({ transferDate: { $gte: oneMonthAgo } })
        .exec();

      this.logger.log(`[Companies-Service]: Total transfers found: ${total}`);

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get paginated transfers
      const transfers = await this.transferModel
        .find({ transferDate: { $gte: oneMonthAgo } })
        .populate('companyId')
        .sort({ transferDate: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      this.logger.log(`[Companies-Service]: Returning ${transfers.length} transfers for page ${page}`);

      const data = transfers.map(transfer => {
        const company = transfer.companyId as any;
        
        if (!company) {
          this.logger.warn(`[Companies-Service]: Transfer ${transfer._id} has no associated company`);
          return null;
        }

        return new TransferWithCompanyDto({
          id: transfer._id.toString(),
          companyId: company._id.toString(),
          amount: transfer.amount,
          debitAccount: transfer.debitAccount,
          creditAccount: transfer.creditAccount,
        });
      }).filter(transfer => transfer !== null);

      return { data, total };
    } catch (error) {
      this.logger.error(`[Companies-Service]: Error fetching transfers - ${error.message}`);
      throw error;
    }
  }

  async getCompaniesJoinedLastMonth(page: number = 1, limit: number = 10): Promise<{ data: CompanyJoinedResponseDto[], total: number }> {
    this.logger.log(`[Companies-Service]: Fetching companies that joined in the last month (page: ${page}, limit: ${limit})`);

    try {
      // Calculate one month ago in configured timezone (UTC-3) at start of day
      const oneMonthAgo = moment.tz(TIMEZONE.NAME).subtract(1, 'month').startOf('day').toDate();
      const now = moment.tz(TIMEZONE.NAME).toDate();

      this.logger.log(`[Companies-Service]: Current date: ${moment(now).tz(TIMEZONE.NAME).format('DD/MM/YYYY HH:mm:ss')}`);
      this.logger.log(`[Companies-Service]: Searching for companies since ${moment(oneMonthAgo).tz(TIMEZONE.NAME).format('DD/MM/YYYY HH:mm:ss')}`);
      this.logger.log(`[Companies-Service]: Query: adhesionDate >= ${oneMonthAgo.toISOString()}`);

      // Get total count
      const total = await this.companyModel
        .countDocuments({ adhesionDate: { $gte: oneMonthAgo } })
        .exec();

      this.logger.log(`[Companies-Service]: Total companies found: ${total}`);

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get paginated companies - only select required fields
      const companies = await this.companyModel
        .find({ adhesionDate: { $gte: oneMonthAgo } })
        .select('cuit businessName companyType adhesionDate')
        .sort({ adhesionDate: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      this.logger.log(`[Companies-Service]: Returning ${companies.length} companies for page ${page}`);
      
      // Debug: log each company returned
      companies.forEach((company, index) => {
        this.logger.log(`[Companies-Service]:   ${skip + index + 1}. ${company.businessName} (CUIT: ${company.cuit}) - adhesionDate: ${moment(company.adhesionDate).tz(TIMEZONE.NAME).format('DD/MM/YYYY HH:mm:ss')}`);
      });

      const data = companies.map(company => new CompanyJoinedResponseDto({
        id: company._id.toString(),
        cuit: company.cuit,
        businessName: company.businessName,
        companyType: company.companyType,
        adhesionDate: company.adhesionDate,
      }));

      return { data, total };
    } catch (error) {
      this.logger.error(`[Companies-Service]: Error fetching companies joined last month - ${error.message}`);
      throw error;
    }
  }

  async findById(id: string): Promise<CompanyDocument> {
    this.logger.log(`[Companies-Service]: Finding company by ID ${id}`);
    
    const company = await this.companyModel.findById(id).exec();
    
    if (!company) {
      this.logger.warn(`[Companies-Service]: Company with ID ${id} not found`);
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    
    return company;
  }
}


