import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const port = Number(this.configService.get<number>('SMTP_PORT') || 587);

    const secure = this.configService.get<string>('SMTP_SECURE') === 'true';

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: port,
      secure: secure,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendOtpEmail(to: string, code: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Doclab.uz" <${this.configService.get<string>('SMTP_USER')}>`,
        to,
        subject: 'Tizimga kirish uchun tasdiqlash kodi',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
            <h2 style="color: #0088cc; text-align: center;">Doclab.uz</h2>
            <p style="font-size: 16px; color: #333;">Salom,</p>
            <p style="font-size: 16px; color: #333;">Sizning tizimga kirish kodingiz:</p>
            <div style="text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #ff6b00; padding: 10px 20px; background: #fff5eb; border-radius: 8px;">
                ${code}
              </span>
            </div>
            <p style="font-size: 14px; color: #888; text-align: center;">Ushbu kod 5 daqiqa davomida amal qiladi. Kodni hech kimga bermang!</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP email sent to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw new Error(
        "Email yuborishda xatolik yuz berdi. Keyinroq urinib ko'ring.",
      );
    }
  }
}
