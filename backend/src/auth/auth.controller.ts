import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LoginDto } from 'src/auth/dto/login.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/users/schema/user.schema';
import { CurrentUser } from './decorators/current-user.decorators';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @HttpCode(200)
  async me(@CurrentUser('sub') userId: number) {
    const user = await this.authService.findById(userId);
    return { user };
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
    this.logger.log('Login keldi', loginDto);
    const { user, accessToken, refreshToken } =
      await this.authService.login(loginDto);

    this.setRefreshCookie(res, refreshToken);

    this.logger.log('Login bo`ldi', user);
    return { user, accessToken };
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
