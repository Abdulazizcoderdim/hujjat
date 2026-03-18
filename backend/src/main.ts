import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    }),
  );

  app.setGlobalPrefix('api');
  app.use(cookieParser());

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(','),
    credentials: true,
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
    setHeaders: (res) => {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      res.set('Content-Type', 'application/pdf');
    },
  });

  await app.listen(process.env.PORT || 3000);

  console.log(
    `🚀Server ishga tushdi: http://localhost:${process.env.PORT}/api`,
  );
}

bootstrap();
