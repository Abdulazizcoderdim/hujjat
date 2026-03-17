import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { Category } from 'src/category/schemas/category.schema';
import { StorageService } from 'src/storage/storage.service';
import { User } from 'src/users/schema/user.schema';
import { Repository } from 'typeorm';
import { ApproveProductDto } from './dto/approve-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { Product, ProductStatus } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly storageService: StorageService,
  ) {}

  async approve(id: number, dto: ApproveProductDto) {
    const product = await this.productRepo.findOne({
      where: { id },
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    product.status = dto.status;
    return this.productRepo.save(product);
  }

  async findOneById(id: number) {
    const product = await this.productRepo.findOne({
      where: { id },
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    return product;
  }

  async getProductsAnalytics() {
    const result = await this.productRepo
      .createQueryBuilder('product')
      .select("DATE_TRUNC('day', product.createdAt)", 'date')
      .addSelect('COUNT(*)', 'total')
      .addSelect("COUNT(*) FILTER (WHERE status = 'approved')", 'approved')
      .addSelect("COUNT(*) FILTER (WHERE status = 'rejected')", 'rejected')
      .where("product.createdAt > NOW() - INTERVAL '7 days'")
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    return result.map((row) => ({
      name: new Date(row.date).toLocaleDateString('uz-UZ', {
        day: 'numeric',
        month: 'short',
      }),
      total: parseInt(row.total),
      approved: parseInt(row.approved),
      rejected: parseInt(row.rejected),
    }));
  }

  async getProductsByStatus(
    status: ProductStatus,
    page: number,
    limit: number,
    category?: number,
  ) {
    const [items, total] = await this.productRepo.findAndCount({
      where: { status },
      relations: ['category'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
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

  async createProduct(dto: CreateProductDto) {
    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    const slug = slugify(dto.name, { lower: true, strict: true });
    const exists = await this.productRepo.findOne({
      where: [{ name: dto.name }, { slug }],
    });

    if (exists) {
      throw new BadRequestException('Product already exists');
    }

    const product = this.productRepo.create({
      name: dto.name,
      slug,
      description: dto.description,
      price: dto.price,
      fileKey: dto.fileKey,
      fileExt: dto.fileKey.split('.').pop(),
      category: category,
      status: ProductStatus.APPROVED,
    });

    return this.productRepo.save(product);
  }
}
