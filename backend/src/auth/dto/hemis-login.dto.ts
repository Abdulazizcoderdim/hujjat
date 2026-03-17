import { IsNotEmpty, MinLength } from 'class-validator';

export class HemisLoginDto {
  @IsNotEmpty({ message: "Login bo'sh bo'lishi mumkin emas" })
  login: string;

  @IsNotEmpty({ message: "Parol bo'sh bo'lishi mumkin emas" })
  @MinLength(4, { message: "Parol kamida 4 ta belgidan iborat bo'lishi kerak" })
  password: string;
}
