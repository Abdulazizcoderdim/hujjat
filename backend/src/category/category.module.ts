import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/products/schemas/product.schema';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category } from './schemas/category.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Product]),
    JwtModule.register({}),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
