import { IsNotEmpty, Length } from 'class-validator';

export class TelegramDto {
  @Length(6, 6, { message: "Kod 6 ta belgidan iborat bo'lishi kerak" })
  @IsNotEmpty({ message: "Kod bo'sh bo'lishi mumkin emas" })
  code: string;
}
