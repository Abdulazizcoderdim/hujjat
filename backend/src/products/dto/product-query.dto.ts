import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ProductQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 12;

  @IsOptional()
  search?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  categoryId?: number;

  @IsOptional()
  @IsIn(['new', 'popular', 'sold', 'price-low', 'price-high'])
  sort?: 'new' | 'popular' | 'sold' | 'price-low' | 'price-high';

  @IsOptional()
  authorId?: string;

  @IsOptional()
  @IsIn(['name', 'price', 'soldCount', 'createdAt', 'categoryId'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
