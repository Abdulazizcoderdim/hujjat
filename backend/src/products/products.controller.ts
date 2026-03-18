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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CurrentUser } from 'src/auth/decorators/current-user.decorators';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { editFileName, fileFilter } from 'src/helper/file-upload.utils';
import { UserRole } from 'src/users/schema/user.schema';
import { ApproveProductDto } from './dto/approve-product.dto';
import { ProductsService } from './products.service';
import { ProductStatus } from './schemas/product.schema';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

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

    const url = '';

    return { url };
  }

  @Get('status/:status')
  async getProductsByStatus(
    @Param('status', new ParseEnumPipe(ProductStatus)) status: ProductStatus,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('category', new ParseIntPipe({ optional: true })) category: number,
  ) {
    return this.productsService.getProductsByStatus(
      status,
      page,
      limit,
      category,
    );
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  approve(@Param('id') id: number, @Body() dto: ApproveProductDto) {
    return this.productsService.approve(id, dto);
  }

  // @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  // async createProduct(@Body() dto: CreateProductDto) {
  //   return this.productsService.createProduct(dto);
  // }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'poster', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: editFileName,
        }),
        fileFilter: fileFilter,
      },
    ),
  )
  async create(
    @UploadedFiles()
    files: { file?: Express.Multer.File[]; poster?: Express.Multer.File[] },
    @Body() createProductDto: any,
  ) {
    console.log('CREATE PRODUCT DTO::::', createProductDto);
    console.log('FILES::::', files);
    const file = files?.file ? files.file[0] : null;
    const poster = files?.poster ? files.poster[0] : null;

    if (!file) {
      throw new BadRequestException('Fayl yuklanishi majburiy');
    }

    return this.productsService.create(createProductDto, file, poster);
  }
}
