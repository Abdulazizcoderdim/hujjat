import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorators';
import { Roles } from 'src/auth/decorators/roles.decorator';
import {
  PhoneAuthDto,
  SendEmailCodeDto,
  VerifyEmailCodeDto,
} from 'src/auth/dto/email.dto';
import { LoginDto } from 'src/auth/dto/login.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/users/schema/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('email/send-code')
  @HttpCode(HttpStatus.OK)
  async sendEmailCode(@Body() dto: SendEmailCodeDto) {
    return this.authService.sendEmailCode(dto.email.toLowerCase());
  }

  @Post('email/verify')
  @HttpCode(HttpStatus.OK)
  async verifyEmailCode(@Body() dto: VerifyEmailCodeDto) {
    return this.authService.verifyEmailCode(dto.email.toLowerCase(), dto.code);
  }

  @Post('phone')
  @HttpCode(HttpStatus.OK)
  async loginWithPhone(@Body() dto: PhoneAuthDto) {
    return this.authService.loginWithPhone(dto.phone);
  }

  @Post('register')
  @HttpCode(201)
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.register(registerDto);

    this.setRefreshCookie(res, refreshToken);

    return { user, accessToken };
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.login(loginDto);

    this.setRefreshCookie(res, refreshToken);

    return { user, accessToken };
  }

  @Post('set-credentials')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async setCredentials(
    @CurrentUser('sub') userId: number,
    @Body() body: { login: string; password: string },
  ) {
    return this.authService.setCredentials(userId, body);
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) throw new UnauthorizedException('Refresh token yo‘q');

    const tokens = await this.authService.refreshAccessToken(refreshToken);

    this.setRefreshCookie(res, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      user: tokens.user,
      refreshToken: tokens.refreshToken,
    };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    const isProd = process.env.NODE_ENV === 'production';

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProd,
      ...(isProd && { domain: '.doclab.uz' }),
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    });

    return { success: true };
  }

  // @Post('telegram')
  // @HttpCode(200)
  // async telegramLogin(
  //   @Body('code') code: string,
  //   @Res({ passthrough: true }) res: Response,
  //   @Req() req: Request,
  // ) {
  //   const { user, accessToken, refreshToken, needsSetup } =
  //     await this.authService.telegramLogin(code, req.authContext);

  //   this.setRefreshCookie(res, refreshToken);

  //   return { user, accessToken, needsSetup };
  // }

  @Post('create-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(201)
  async createAdmin(@Body() registerDto: RegisterDto) {
    return this.authService.createAdmin(registerDto);
  }

  @Post('google')
  @HttpCode(200)
  async googleLogin(
    @Body('idToken') idToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken, needsSetup } =
      await this.authService.googleLogin(idToken);

    this.setRefreshCookie(res, refreshToken);

    return { user, accessToken, needsSetup };
  }

  @Post('seller-login')
  @HttpCode(200)
  async sellerLoginByCredentials(
    @Body() body: { login: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.sellerLoginByCredentials(body);

    this.setRefreshCookie(res, refreshToken);

    return { user, accessToken };
  }

  private setRefreshCookie(res: Response, refreshToken: string) {
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      ...(isProd && { domain: '.doclab.uz' }),
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
