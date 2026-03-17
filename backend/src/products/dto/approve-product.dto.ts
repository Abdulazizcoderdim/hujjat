import { IsEnum } from 'class-validator';
import { ProductStatus } from '../schemas/product.schema';

export class ApproveProductDto {
  @IsEnum(ProductStatus)
  status: ProductStatus;
}
