import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
  app.use(cookieParser());

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(','),
    credentials: true,
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
    // setHeaders: (res) => {
    //   res.removeHeader('X-Frame-Options');

    //   res.set('Access-Control-Allow-Origin', '*');
    //   res.set('Cross-Origin-Resource-Policy', 'cross-origin');

    //   res.set('Content-Security-Policy', "frame-ancestors 'self' *");
    // },
  });

  await app.listen(process.env.PORT || 3000);

  console.log(
    `🚀Server ishga tushdi: http://localhost:${process.env.PORT}/api`,
  );
}

bootstrap();
