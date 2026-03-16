import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { Product, ProductStatus } from 'src/products/schemas/product.schema';
import { ILike, Repository } from 'typeorm';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './schemas/category.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getSitemapData() {
    return this.categoryRepo.find({
      select: ['slug', 'updatedAt', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  async findProductsByCategory(slug: string, query: any) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 8, 50);
    const skip = (page - 1) * limit;

    const category = await this.categoryRepo.findOne({
      where: { slug },
    });

    if (!category) {
      throw new NotFoundException('Category topilmadi!');
    }

    const [products, total] = await this.productRepo.findAndCount({
      where: {
        category: { id: category.id },
        status: ProductStatus.APPROVED,
      },
      relations: ['author', 'category'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      category: category.name,
      items: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.name, { lower: true, strict: true });

    const exists = await this.categoryRepo.findOne({
      where: [{ name: dto.name }, { slug }],
    });

    if (exists) {
      throw new ConflictException('Category already exists');
    }

    const category = this.categoryRepo.create({
      name: dto.name,
      slug,
      icon: dto.icon,
    });

    return this.categoryRepo.save(category);
  }

  async findAll(query: CategoryQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 8, 50);
    const skip = (page - 1) * limit;

    const where = query.search ? { name: ILike(`%${query.search}%`) } : {};

    const [items, total] = await this.categoryRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    if (dto.name) {
      category.name = dto.name;
      category.slug = slugify(dto.name, { lower: true, strict: true });
    }

    if (dto.icon !== undefined) {
      category.icon = dto.icon;
    }

    return this.categoryRepo.save(category);
  }

  async remove(id: number) {
    await this.categoryRepo.delete(id);
    return { message: 'Category deleted' };
  }

  async findAllForAI() {
    const categories = await this.categoryRepo.find({
      select: ['id', 'name'],
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
    }));
  }

  async findByName(name: string) {
    const category = await this.categoryRepo.findOne({
      where: { name },
    });

    return category?.id;
  }
}
