import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class SendEmailCodeDto {
  @IsEmail({}, { message: 'Yaroqsiz email manzil' })
  @IsNotEmpty()
  email: string;
}

export class VerifyEmailCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(6, 6, { message: "Kod 6 xonali bo'lishi kerak" })
  code: string;
}

export class PhoneAuthDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+998[0-9]{9}$/, {
    message: "Telefon raqam +998XXXXXXXXX formatida bo'lishi kerak",
  })
  phone: string;
}
