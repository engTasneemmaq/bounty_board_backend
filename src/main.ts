import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Sequelize } from 'sequelize-typescript';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        console.error('Validation errors:', JSON.stringify(errors, null, 2));
        return new BadRequestException(errors);
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Security middleware
  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );

  // Serve static uploads
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // Get Sequelize instance
  const sequelize = app.get<Sequelize>(Sequelize);

  // SAFE SYNC STRATEGY
  if (process.env.NODE_ENV === 'development') {
    if (process.env.RESET_DB === 'true') {
      // Force reset only when explicitly requested
      await sequelize.sync({ force: true });
      console.log('Database reset complete');
    } else {
      // Safe sync (no skip option available in Sequelize)
      await sequelize.sync({ alter: true });
      console.log('Safe sync completed');
    }
  } else {
    // Production: Disable auto-sync completely
    console.log('Auto-sync disabled in production');
  }

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Bounty Board API')
    .setDescription(`Welcome to the Bounty Board API documentation.\n\nThis API powers the Bounty Board platform, supporting user registration, authentication, project management, notifications, and more.\n\n**Auth endpoints require Bearer JWT unless otherwise noted.**`)
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT token received after login.'
    }, 'access-token')
    .setContact('Bounty Board Team', 'https://github.com/admin-MENADevs/Bounty_Board_Project_Backend', 'MENA1138@menadevs.io')
    .setExternalDoc('Find more info here', 'https://github.com/admin-MENADevs/Bounty_Board_Project_Backend')
    .addServer('http://localhost:3000', 'Local development server')
    .addServer('https://api.bountyboard.com', 'Production server comming soon')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
