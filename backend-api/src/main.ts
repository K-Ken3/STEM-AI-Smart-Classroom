import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation
  app.useGlobalPipes(new ValidationPipe());

  // Enable CORS (for frontend later)
  app.enableCors();

  await app.listen(process.env.PORT || 3000);

  console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
}
bootstrap();