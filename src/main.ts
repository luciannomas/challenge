import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as moment from 'moment-timezone';
import { TIMEZONE } from './common/constants/timezone.constant';

// Configure timezone to UTC-3 (America/Buenos_Aires - Argentina)
moment.tz.setDefault(TIMEZONE.NAME);

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  const currentTime = moment.tz(TIMEZONE.NAME);
  const offset = currentTime.format('Z'); // +/-HH:MM format
  
  logger.log(`[Interbanking-API]: Timezone configured: ${TIMEZONE.DESCRIPTION}${offset}`);
  logger.log(`[Interbanking-API]: Current time: ${currentTime.format('DD/MM/YYYY HH:mm:ss')} (${TIMEZONE.DESCRIPTION}${offset})`);


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Interbanking API')
    .setDescription('API for managing companies and bank transfers - Challenge')
    .setVersion('1.0')
    .addTag('Companies', 'Company management endpoints')
    .addTag('Transfers', 'Transfer management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Token',
        name: 'Authorization',
        description: 'Enter token: asdasdsafd',
        in: 'header',
      },
      'bearer-token',
    )
    .addServer('http://localhost:3000', 'Local Development')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Interbanking API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  logger.log(`[Interbanking-API]: Application is running on port ${port}`);
  logger.log(`[Interbanking-API]: Swagger documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();


