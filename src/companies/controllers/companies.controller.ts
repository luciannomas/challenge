import { Controller, Get, Post, Body, HttpCode, HttpStatus, Logger, UseInterceptors, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CompaniesService } from '../services/companies.service';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { CompanyAdhesionResponseDto } from '../dto/company-adhesion-response.dto';
import { PaginatedTransfersResponseDto } from '../dto/paginated-transfers-response.dto';
import { PaginatedCompaniesJoinedResponseDto } from '../dto/paginated-companies-joined-response.dto';
import { TimezoneInterceptor } from '../../common/interceptors/timezone.interceptor';
import { ErrorExamples } from '../../common/dto/error-response.dto';

@ApiTags('Companies')
@Controller('companies')
@UseInterceptors(TimezoneInterceptor)
export class CompaniesController {
  private readonly logger = new Logger(CompaniesController.name);

  constructor(private readonly companiesService: CompaniesService) {}

  @Post('adhesion')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Register a new company adhesion',
    description: 'Registers a new company (SME or Corporate) to the system. Requires Bearer token authentication.',
  })
  @ApiBearerAuth('bearer-token')
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Company successfully registered',
    type: CompanyAdhesionResponseDto,
    example: {
      id: '691659ca75073179dfe1d7da',
      cuit: '20333444555',
      businessName: 'Tech Solutions SA',
      companyType: 'sme',
      adhesionDate: '2025-11-14T18:30:00-03:00',
    },
  })
  @ApiResponse({ status: 400, ...ErrorExamples.BadRequest })
  @ApiResponse({ status: 401, ...ErrorExamples.Unauthorized })
  @ApiResponse({ status: 409, ...ErrorExamples.Conflict })
  @ApiResponse({ status: 500, ...ErrorExamples.InternalServerError })
  async registerCompany(@Body() createCompanyDto: CreateCompanyDto): Promise<CompanyAdhesionResponseDto> {
    this.logger.log(`[Companies-Controller]: POST /companies/adhesion - Registering new company (authenticated)`);
    
    try {
      const result = await this.companiesService.createCompany(createCompanyDto);
      this.logger.log(`[Companies-Controller]: Company registered successfully`);
      
      // Return only relevant fields (exclude createdAt and updatedAt)
      return new CompanyAdhesionResponseDto({
        id: result.id,
        cuit: result.cuit,
        businessName: result.businessName,
        companyType: result.companyType,
        adhesionDate: result.adhesionDate,
      });
    } catch (error) {
      this.logger.error(`[Companies-Controller]: Error registering company - ${error.message}`);
      throw error;
    }
  }

  @Get('with-transfers/last-month')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get transfers from last month',
    description: 'Returns paginated list of transfers made by companies in the last month. Rate limited to 5 requests per 30 seconds.',
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Records per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved transfers',
    type: PaginatedTransfersResponseDto,
    example: {
      data: [
        {
          id: '691659ca75073179dfe1d7db',
          companyId: '691659ca75073179dfe1d7da',
          amount: 150000.50,
          debitAccount: '1234567890123456',
          creditAccount: '6543210987654321',
        },
      ],
      meta: {
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3,
      },
    },
  })
  @ApiResponse({ status: 400, ...ErrorExamples.BadRequest })
  @ApiResponse({ status: 429, ...ErrorExamples.TooManyRequests })
  @ApiResponse({ status: 500, ...ErrorExamples.InternalServerError })
  async getCompaniesWithTransfersLastMonth(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedTransfersResponseDto> {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    // Validate pagination params
    const validPage = pageNumber > 0 ? pageNumber : 1;
    const validLimit = limitNumber > 0 && limitNumber <= 100 ? limitNumber : 10;

    this.logger.log(`[Companies-Controller]: GET /companies/with-transfers/last-month?page=${validPage}&limit=${validLimit}`);
    
    try {
      const { data, total } = await this.companiesService.getCompaniesWithTransfersLastMonth(validPage, validLimit);
      const totalPages = Math.ceil(total / validLimit);

      const response = new PaginatedTransfersResponseDto({
        data,
        meta: {
          total,
          page: validPage,
          limit: validLimit,
          totalPages,
        },
      });

      this.logger.log(`[Companies-Controller]: Retrieved ${data.length} transfers (page ${validPage}/${totalPages}, total: ${total})`);
      return response;
    } catch (error) {
      this.logger.error(`[Companies-Controller]: Error fetching transfers - ${error.message}`);
      throw error;
    }
  }

  @Get('joined/last-month')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get companies joined last month',
    description: 'Returns paginated list of companies that joined in the last month. Rate limited to 5 requests per 30 seconds.',
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Records per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved companies',
    type: PaginatedCompaniesJoinedResponseDto,
    example: {
      data: [
        {
          id: '691659ca75073179dfe1d7da',
          cuit: '20333444555',
          businessName: 'Innovatech Argentina SA',
          companyType: 'corporate',
          adhesionDate: '2025-10-20T15:30:00-03:00',
        },
      ],
      meta: {
        total: 8,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    },
  })
  @ApiResponse({ status: 400, ...ErrorExamples.BadRequest })
  @ApiResponse({ status: 429, ...ErrorExamples.TooManyRequests })
  @ApiResponse({ status: 500, ...ErrorExamples.InternalServerError })
  async getCompaniesJoinedLastMonth(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedCompaniesJoinedResponseDto> {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    // Validate pagination params
    const validPage = pageNumber > 0 ? pageNumber : 1;
    const validLimit = limitNumber > 0 && limitNumber <= 100 ? limitNumber : 10;

    this.logger.log(`[Companies-Controller]: GET /companies/joined/last-month?page=${validPage}&limit=${validLimit}`);
    
    try {
      const { data, total } = await this.companiesService.getCompaniesJoinedLastMonth(validPage, validLimit);
      const totalPages = Math.ceil(total / validLimit);

      const response = new PaginatedCompaniesJoinedResponseDto({
        data,
        meta: {
          total,
          page: validPage,
          limit: validLimit,
          totalPages,
        },
      });

      this.logger.log(`[Companies-Controller]: Retrieved ${data.length} companies (page ${validPage}/${totalPages}, total: ${total})`);
      return response;
    } catch (error) {
      this.logger.error(`[Companies-Controller]: Error fetching companies joined last month - ${error.message}`);
      throw error;
    }
  }
}


