import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/category/schemas/category.schema';
import { User } from 'src/users/schema/user.schema';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './schemas/product.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, User]),
    JwtModule.register({}),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
