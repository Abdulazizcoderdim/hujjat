import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from 'src/mail/mail.service';
import { OtpModule } from 'src/otp/otp.module';
import { Token } from 'src/tokens/schemas/token.schema';
import { TokensModule } from 'src/tokens/tokens.module';
import { TokensService } from 'src/tokens/tokens.service';
import { User } from 'src/users/schema/user.schema';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User, Token]),
    OtpModule,
    TokensModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, TokensService],
})
export class AuthModule {}
