import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorators';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { StorageService } from 'src/storage/storage.service';
import { UserRole } from 'src/users/schema/user.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { ProductStatus } from './schemas/product.schema';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly storageService: StorageService,
  ) {}

  @Get('related/:slug')
  async getRelatedProducts(@Param('slug') slug: string) {
    return this.productsService.getRelatedProducts(slug);
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async getDownloadUrl(@Param('id') productId: number) {
    const product = await this.productsService.findOneById(productId);
    // s
    const url = await this.storageService.getDownloadUrl(product.fileKey);

    return { url };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: number,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: { sub: number; role: UserRole },
  ) {
    return this.productsService.update(id, dto, user);
  }

  @Get('all/:status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getProducts(
    @Query() query: ProductQueryDto,
    @Param('status') status: ProductStatus,
  ) {
    return this.productsService.allGetByStatus(query, status);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getProductsSeller(
    @Query() query: ProductQueryDto,
    @CurrentUser('sub') sellerId: number,
  ) {
    return this.productsService.findPublic(query, sellerId);
  }

  @Get('/approved')
  getApprovedProducts(@Query() query: ProductQueryDto) {
    return this.productsService.findPublicApproved(query);
  }

  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.productsService.findOnePublic(id);
  }

  @Get('/byslug/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateProductDto, @CurrentUser('sub') userId: number) {
    return this.productsService.create(dto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  delete(
    @Param('id') id: number,
    @CurrentUser() user: { sub: number; role: UserRole },
  ) {
    return this.productsService.delete(id, user);
  }

  @Delete('bulk/delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  bulkDelete(
    @Body() body: { ids: number[] },
    @CurrentUser() user: { sub: number; role: UserRole },
  ) {
    return this.productsService.bulkDelete(body.ids, user);
  }
}
