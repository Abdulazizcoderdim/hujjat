import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString({ message: "To'liq ism kiriting" })
  @MinLength(3, {
    message: "To'liq ism kamida 3 ta belgidan iborat bo'lishi kerak",
  })
  @MaxLength(50, {
    message: "To'liq ism maksimal 50 ta belgidan iborat bo'lishi kerak",
  })
  full_name: string;

  @IsEmail({}, { message: 'Iltimos yaroqli email kiriting' })
  email: string;

  @IsNotEmpty({ message: "Parol bo'sh bo'lishi mumkin emas" })
  @MinLength(4, { message: "Parol kamida 4 ta belgidan iborat bo'lishi kerak" })
  password: string;
}
