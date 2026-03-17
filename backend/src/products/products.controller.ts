import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
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
import { ApproveProductDto } from './dto/approve-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { ProductStatus } from './schemas/product.schema';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly storageService: StorageService,
  ) {}

  @Get('analytics')
  async getProductsChartData() {
    return this.productsService.getProductsAnalytics();
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getDownloadUrl(
    @CurrentUser('role') userRole: UserRole,
    @Param('id') productId: number,
  ) {
    const product = await this.productsService.findOneById(productId);

    if (userRole !== UserRole.ADMIN) {
      throw new BadRequestException('Ruxsat yo‘q');
    }

    const url = await this.storageService.getDownloadUrl(
      product.fileKey,
      300,
      true,
    );

    return { url };
  }

  @Get('status/:status')
  async getProductsByStatus(
    @Param('status', new ParseEnumPipe(ProductStatus)) status: ProductStatus,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.productsService.getProductsByStatus(status, page, limit);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  approve(@Param('id') id: number, @Body() dto: ApproveProductDto) {
    return this.productsService.approve(id, dto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Post('single/prepare')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async prepareSingleUpload(
    @Body()
    dto: {
      filename: string;
      contentType: string;
    },
  ) {
    const result = await this.storageService.getUploadUrl(
      dto.filename,
      dto.contentType,
    );

    return {
      uploadUrl: result.uploadUrl,
      fileKey: result.key,
    };
  }

  @Post('single/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async completeSingleUpload(
    @Body()
    dto: {
      fileKey: string;
      filename: string;
      contentType: string;

      price: number;
      name: string;
      description: string;
      categoryId: string;
      tags?: string[];
    },
  ) {
    if (!dto.price || dto.price < 1000) {
      throw new BadRequestException('Narx 1000 so‘mdan kam bo‘lmasligi kerak');
    }

    if (!dto.name?.trim()) {
      throw new BadRequestException('Nomi majburiy');
    }

    if (!dto.description?.trim()) {
      throw new BadRequestException('Tavsif majburiy');
    }

    if (!dto.categoryId) {
      throw new BadRequestException('Category tanlanmagan');
    }

    return {
      message: 'Fayl qabul qilindi, ishlov berilmoqda',
      status: 'processing',
    };
  }
}
