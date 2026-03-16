import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  categoryId: number;

  @IsString()
  fileKey: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  tags?: string[];
}
