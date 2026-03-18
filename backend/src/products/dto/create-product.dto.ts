import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsOptional()
  tags?: string;

  @IsOptional()
  @IsNumberString()
  pages?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsOptional()
  @IsNumberString()
  year?: string;

  @IsString()
  @IsOptional()
  language?: string;
}
