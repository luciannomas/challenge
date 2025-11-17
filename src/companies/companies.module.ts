import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompaniesController } from './controllers/companies.controller';
import { CompaniesService } from './services/companies.service';
import { Company, CompanySchema } from './schemas/company.schema';
import { Transfer, TransferSchema } from '../transfers/schemas/transfer.schema';
import { AuthMiddleware } from '../common/middleware/auth.middleware';
import { RateLimitMiddleware } from '../common/middleware/rate-limit.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
      { name: Transfer.name, schema: TransferSchema },
    ]),
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Authentication middleware for POST /companies/adhesion
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: 'companies/adhesion', method: RequestMethod.POST });

    // Rate limiting middleware for GET endpoints
    consumer
      .apply(RateLimitMiddleware)
      .forRoutes(
        { path: 'companies/with-transfers/last-month', method: RequestMethod.GET },
        { path: 'companies/joined/last-month', method: RequestMethod.GET },
      );
  }
}


