import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { MailService } from 'src/mail/mail.service';
import { OtpService } from 'src/otp/otp.service';
import { TokensService } from 'src/tokens/tokens.service';
import { User, UserRole } from 'src/users/schema/user.schema';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    @InjectRepository(User)
    private userModel: Repository<User>,
    private otpService: OtpService,
    private jwtService: JwtService,
    private mailService: MailService,
    private tokensService: TokensService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');
    const fullName = this.configService.get<string>('ADMIN_FULL_NAME');

    if (!email || !password) return;

    const exists = await this.userModel.findOne({
      where: {
        role: UserRole.ADMIN,
      },
    });
    if (exists) return;

    const hashedPassword = await this.hashPassword(password);

    const admin = this.userModel.create({
      email,
      password: hashedPassword,
      full_name: fullName || 'Admin',
      is_active: true,
      role: UserRole.ADMIN,
    });

    await this.userModel.save(admin);

    this.logger.log(`✅ Admin yaratildi: ${email}`);
  }

  async sendEmailCode(email: string) {
    try {
      const code = randomInt(100000, 999999).toString();

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      await this.otpService.createForEmail(email, code, expiresAt);

      await this.mailService.sendOtpEmail(email, code);

      return { message: 'Tasdiqlash kodi emailga yuborildi' };
    } catch (error) {
      throw new InternalServerErrorException('Kod yuborishda xatolik');
    }
  }

  async verifyEmailCode(email: string, code: string) {
    const validOtp = await this.otpService.validateEmailOtp(email, code);

    if (!validOtp) {
      throw new BadRequestException('Kod xato yoki muddati tugagan');
    }

    await this.otpService.markUsed(validOtp);

    let user = await this.userModel.findOne({ where: { email } });

    if (!user) {
      user = this.userModel.create({
        email,
        role: UserRole.STUDENT,
        is_active: true,
      });

      await this.userModel.save(user);
    }

    const token = this.generateTokens(user);

    await this.tokensService.saveRefreshToken({
      userId: user.id,
      refreshToken: token.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      ...token,
      user,
    };
  }

  async loginWithPhone(phone: string) {
    let user = await this.userModel.findOne({ where: { phone } });

    if (!user) {
      user = this.userModel.create({
        phone,
        role: UserRole.STUDENT,
        is_active: true,
      });

      await this.userModel.save(user);
    }

    const token = this.generateTokens(user);

    await this.tokensService.saveRefreshToken({
      userId: user.id,
      refreshToken: token.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      ...token,
      user,
    };
  }

  async sellerLoginByCredentials(dto: { login: string; password: string }) {
    const user = await this.userModel.findOne({
      where: { login: dto.login },
      select: ['password'],
    });

    if (!user) throw new UnauthorizedException("Login yoki parol noto'g'ri");

    if (user.role !== UserRole.STUDENT) {
      throw new ForbiddenException('Faqat sotuvchi kira oladi');
    }

    const isValid = await this.verifyPassword(
      dto.password,
      user.password ?? '',
    );
    if (!isValid) throw new UnauthorizedException("Login yoki parol noto'g'ri");

    const tokens = this.generateTokens(user);

    await this.tokensService.saveRefreshToken({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        is_active: user.is_active,
        avatar: user.avatar,
        role: user.role,
        login: user.login,
      },
      ...tokens,
    };
  }

  async googleLogin(idToken: string) {
    if (!idToken) throw new UnauthorizedException('idToken yo‘q');

    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new UnauthorizedException('Google payload yo‘q');

    const googleId = payload.sub;
    const email = payload.email;
    const fullName = payload.name;
    const avatar = payload.picture;

    if (!email) throw new UnauthorizedException('Google email yo‘q');

    let user = await this.userModel.findOne({ where: { email } });

    if (!user) {
      user = this.userModel.create({
        email,
        full_name: fullName,
        avatar,
        is_active: true,
        role: UserRole.STUDENT,
        googleId,
      });

      await this.userModel.save(user);
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account aktiv emas');
    }

    let needSave = false;

    if (!user.full_name && fullName) {
      user.full_name = fullName;
      needSave = true;
    }

    if (!user.avatar && avatar) {
      user.avatar = avatar;
      needSave = true;
    }

    if (!user.googleId && googleId) {
      user.googleId = googleId;
      needSave = true;
    }

    // if (needSave) await user.save();

    const needsSetup =
      user.role === UserRole.STUDENT && (!user.login || !user.password);

    const tokens = this.generateTokens(user);

    await this.tokensService.saveRefreshToken({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        is_active: user.is_active,
        avatar: user.avatar,
        role: user.role,
        login: user.login,
      },
      ...tokens,
      needsSetup,
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userModel.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException("Email allaqachon ro'yxatdan o'tgan");
    }

    const hashedPassword = await this.hashPassword(registerDto.password);

    const newUser = await this.userModel.create({
      full_name: registerDto.full_name,
      email: registerDto.email,
      password: hashedPassword,
      is_active: true,
    });

    const token = this.generateTokens(newUser);

    await this.tokensService.saveRefreshToken({
      userId: newUser.id,
      refreshToken: token.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        is_active: newUser.is_active,
        avatar: newUser.avatar,
        role: newUser.role,
        login: newUser.login,
      },
      ...token,
    };
  }

  async createAdmin(registerDto: RegisterDto) {
    const existingUser = await this.userModel.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException("Email allaqachon ro'yxatdan o'tgan");
    }

    const hashedPassword = await this.hashPassword(registerDto.password);

    const newlyCreatedUser = await this.userModel.create({
      email: registerDto.email,
      full_name: registerDto.full_name,
      password: hashedPassword,
      is_active: true,
      role: UserRole.ADMIN,
    });

    return newlyCreatedUser;
  }

  async login(loginDto: LoginDto) {
    const user = await this.userModel.findOne({
      where: { email: loginDto.email },
      select: ['password'],
    });

    if (!user || !user.is_active)
      throw new UnauthorizedException("Email yoki parol noto'g'ri");

    const isValid = await this.verifyPassword(
      loginDto.password,
      user.password ?? '',
    );

    if (!isValid) throw new UnauthorizedException("Email yoki parol noto'g'ri");

    const tokens = this.generateTokens(user);

    await this.tokensService.saveRefreshToken({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        is_active: user.is_active,
        avatar: user.avatar,
        role: user.role,
        login: user.login,
      },
      ...tokens,
    };
  }

  async refreshAccessToken(oldRefreshToken: string) {
    const tokenDoc = await this.tokensService.findValidToken(oldRefreshToken);

    if (!tokenDoc) throw new UnauthorizedException('Foydalanuvchi topilmadi');

    await this.tokensService.revokeToken(oldRefreshToken);

    const user = await this.getUserById(tokenDoc.user.id);

    const tokens = this.generateTokens(user);

    await this.tokensService.saveRefreshToken({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }

  async getUserById(userId: number) {
    const user = await this.userModel.findOne({ where: { id: userId } });

    if (!user) throw new UnauthorizedException('Foydalanuvchi topilmadi');

    return user;
  }

  async setCredentials(
    userId: number,
    credentialsDto: { login: string; password: string },
  ) {
    const { login, password } = credentialsDto;

    const user = await this.userModel.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Foydalanuvchi topilmadi');

    const existingLogin = await this.userModel.findOne({ where: { login } });
    if (existingLogin) {
      throw new ConflictException(
        'Ushbu login band, iltimos boshqasini tanlang',
      );
    }

    user.login = login;
    user.password = await this.hashPassword(password);

    await this.userModel.save(user);

    const accessToken = this.generateAccessToken(user);

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        is_active: user.is_active,
        avatar: user.avatar,
        role: user.role,
        login: user.login,
      },
      accessToken,
    };
  }

  async logout(refreshToken: string) {
    await this.tokensService.revokeToken(refreshToken);
  }

  async createFromTelegram(
    fullName: string | undefined,
    role: UserRole,
    phone?: string,
  ) {
    return this.userModel.create({
      full_name: fullName,
      is_active: true,
      role,
      ...(phone && { phone }),
    });
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private generateTokens(user: User) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  private generateAccessToken(user: User): string {
    const payload = { sub: user.id, role: user.role };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });
  }

  private generateRefreshToken(user: User): string {
    const payload = {
      sub: user.id,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });
  }
}
