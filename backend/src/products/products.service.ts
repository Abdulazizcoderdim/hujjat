import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import slugify from 'slugify';
import { Category } from 'src/category/schemas/category.schema';
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
  ) {}

  private removeFileFromDisk(fileUrl: string) {
    try {
      const fileName = fileUrl.split('/').pop();

      if (!fileName) return;

      const filePath = path.join(process.cwd(), 'uploads', fileName);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Fayl o'chirildi: ${filePath}`);
      }
    } catch (err) {
      console.error(`Faylni o'chirishda xatolik: ${err.message}`);
    }
  }

  async delete(id: number) {
    const product = await this.productRepo.findOne({
      where: { id },
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    this.removeFileFromDisk(product.fileUrl);
    if (product.poster) {
      this.removeFileFromDisk(product.poster);
    }

    return this.productRepo.remove(product);
  }

  async getBooks() {
    return this.productRepo.find({
      where: { status: ProductStatus.APPROVED },
      relations: ['category'],
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

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
      relations: ['category'],
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

  async create(
    dto: CreateProductDto,
    file: Express.Multer.File,
    poster: Express.Multer.File | null,
  ) {
    const slug = slugify(dto.name, { lower: true, strict: true });

    const exists = await this.productRepo.findOne({
      where: [{ name: dto.name }, { slug }],
    });

    if (exists) {
      throw new BadRequestException('Product already exists');
    }

    const product = this.productRepo.create({
      name: dto.name,
      description: dto.description,
      slug,
      category: { id: dto.categoryId } as any,
      tags: dto.tags ? dto.tags.split(',') : [],
      fileExt: path.extname(file.filename),
      fileSize: file.size,
      poster: poster
        ? this.getPublicUrl(`/uploads/${poster.filename}`)
        : undefined,
      status: ProductStatus.APPROVED,
      fileUrl: this.getPublicUrl(`/uploads/${file.filename}`),

      pages: dto.pages ? Number(dto.pages) : undefined,
      author: dto.author || undefined,
      year: dto.year ? Number(dto.year) : undefined,
      language: dto.language || undefined,
    });

    console.log(product);

    return await this.productRepo.save(product);
  }

  getPublicUrl(path: string) {
    const baseUrl = process.env.SERVER_BASE_URL;
    return `${baseUrl}${path}`;
  }
}
