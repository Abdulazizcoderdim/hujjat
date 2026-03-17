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
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/users/schema/user.schema';
import { CategoryService } from './category.service';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('findAll')
  findAllForAI() {
    return this.categoryService.findAllForAI();
  }

  @Get('sitemap-data')
  async getSitemapData() {
    return this.categoryService.getSitemapData();
  }

  @Get(':slug')
  findProductsByCategory(
    @Param('slug') slug: string,
    @Query() query: CategoryQueryDto,
  ) {
    return this.categoryService.findProductsByCategory(slug, query);
  }

  @Get()
  findAll(@Query() query: CategoryQueryDto) {
    return this.categoryService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.categoryService.remove(id);
  }
}
