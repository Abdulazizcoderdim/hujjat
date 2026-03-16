import { IsArray, IsMongoId } from 'class-validator';

export class PreviewDto {
  @IsArray()
  @IsMongoId({ each: true })
  productIds: number[] = [];
}
