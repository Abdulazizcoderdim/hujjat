import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.setGlobalPrefix('api');
  app.use(cookieParser());

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(','),
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);

  console.log(
    `🚀Server ishga tushdi: http://localhost:${process.env.PORT}/api`,
  );
}

bootstrap();
