import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { OtpModule } from './otp/otp.module';
import { ProductsModule } from './products/products.module';
import { TokensModule } from './tokens/tokens.module';
import { UsersModule } from './users/users.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    UsersModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      username: process.env.DB_USER,
      password: process.env.DB_PASS?.toString(),
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    TokensModule,
    OtpModule,
    ProductsModule,
    CategoryModule,
    UploadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
