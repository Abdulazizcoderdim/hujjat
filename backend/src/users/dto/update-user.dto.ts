import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  full_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: "Login faqat harf, raqam va _ bo'lishi mumkin",
  })
  login?: string;
}
