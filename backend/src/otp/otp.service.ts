import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { Otp, OtpType } from './schemas/otp.schema';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(@InjectRepository(Otp) private otpRepo: Repository<Otp>) {}

  async create(
    code: string,
    expiresAt: Date,
    fullName?: string,
    phone?: string,
  ): Promise<Otp> {
    await this.otpRepo.update(
      {
        used: false,
        expiresAt: MoreThan(new Date()),
      },
      {
        used: true,
        expiredManually: true,
      },
    );

    const otp = this.otpRepo.create({
      code,
      expiresAt,
      fullName,
      phone,
    });

    return this.otpRepo.save(otp);
  }

  async validate(code: string): Promise<Otp | null> {
    return this.otpRepo.findOne({
      where: {
        code,
        used: false,
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  async findActiveOtp(telegramId: number): Promise<Otp | null> {
    return this.otpRepo.findOne({
      where: {
        used: false,
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  async findById(id: number): Promise<Otp | null> {
    return this.otpRepo.findOne({ where: { id } });
  }

  async markUsed(otp: Otp): Promise<void> {
    otp.used = true;
    otp.usedAt = new Date();

    await this.otpRepo.save(otp);
  }

  async markExpired(otp: Otp): Promise<void> {
    otp.used = true;
    otp.expiredAt = new Date();

    await this.otpRepo.save(otp);
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupExpiredOtps() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await this.otpRepo.delete([
        { expiresAt: LessThan(new Date()) },
        { createdAt: LessThan(thirtyDaysAgo) },
      ]);

      this.logger.log(`Cleaned up ${result.affected ?? 0} expired OTPs`);
    } catch (error) {
      this.logger.error(
        `Error cleaning up OTPs: ${error.message}`,
        error.stack,
      );
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async markExpiredOtps() {
    try {
      const result = await this.otpRepo.update(
        {
          used: false,
          expiresAt: LessThan(new Date()),
        },
        {
          used: true,
          expiredAt: new Date(),
        },
      );

      if ((result.affected ?? 0) > 0) {
        this.logger.log(`Marked ${result.affected} OTPs as expired`);
      }
    } catch (error) {
      this.logger.error(
        `Error marking expired OTPs: ${error.message}`,
        error.stack,
      );
    }
  }

  async createForEmail(
    email: string,
    code: string,
    expiresAt: Date,
  ): Promise<Otp> {
    await this.otpRepo.update(
      {
        email,
        type: OtpType.EMAIL,
        used: false,
        expiresAt: MoreThan(new Date()),
      },
      {
        used: true,
        expiredManually: true,
        expiredAt: new Date(),
      },
    );

    const otp = this.otpRepo.create({
      email,
      type: OtpType.EMAIL,
      code,
      expiresAt,
    });

    return this.otpRepo.save(otp);
  }

  async validateEmailOtp(email: string, code: string): Promise<Otp | null> {
    return this.otpRepo.findOne({
      where: {
        email,
        code,
        type: OtpType.EMAIL,
        used: false,
        expiresAt: MoreThan(new Date()),
      },
    });
  }
}
