import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { Category } from 'src/category/schemas/category.schema';
import { generateUniqueSlug } from 'src/common/utils/generate-unique-slug';
import { StorageService } from 'src/storage/storage.service';
import { User, UserRole } from 'src/users/schema/user.schema';
import { ILike, In, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
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

  async getRelatedProducts(slug: string) {
    const product = await this.productRepo.findOne({
      where: { slug },
    });

    if (!product) {
      throw new NotFoundException('Product topilmadi!');
    }

    const cleanTitle = product.name.replace(/\s+/g, ' ').trim();
    const firstThreeWords = cleanTitle.split(' ').slice(0, 3);

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.author', 'author')
      .where('product.status = :status', { status: ProductStatus.APPROVED })
      .andWhere('product.id != :id', { id: product.id })
      .andWhere('author.is_active = true');

    firstThreeWords.forEach((word, index) => {
      qb.orWhere(`product.name ILIKE :word${index}`, {
        [`word${index}`]: `%${word}%`,
      });
    });

    const products = await qb.limit(20).getMany();

    return products;
  }

  async findPublic(query: ProductQueryDto, sellerId: number) {
    const page = query.page || 1;
    const search = query.search;
    const status = query.status;
    const limit = Math.min(query.limit || 12, 50);
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.author', 'author')
      .where('author.is_active = true');

    if (search) {
      qb.andWhere('product.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (status) {
      qb.andWhere('product.status = :status', { status });
    }

    if (sellerId) {
      qb.andWhere('product.authorId = :sellerId', { sellerId });
    }

    if (sortBy === 'categoryId') {
      qb.orderBy('product.createdAt', sortOrder as 'ASC' | 'DESC');
    } else {
      qb.orderBy(`product.${sortBy}`, sortOrder as 'ASC' | 'DESC');
    }

    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

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

  async findPublicApproved(query: ProductQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 12, 50);
    const skip = (page - 1) * limit;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.author', 'author')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.status = :status', { status: ProductStatus.APPROVED })
      .andWhere('author.is_active = true');

    if (query.categoryId) {
      qb.andWhere('category.id = :catId', {
        catId: query.categoryId,
      });
    }

    if (query.search?.trim()) {
      qb.andWhere('product.name ILIKE :search', {
        search: `%${query.search.trim()}%`,
      });
    }

    if (query.sort === 'sold') {
      qb.orderBy('product.soldCount', 'DESC').addOrderBy(
        'product.createdAt',
        'DESC',
      );
    } else if (query.sort === 'popular') {
      qb.orderBy('product.viewCount', 'DESC').addOrderBy(
        'product.createdAt',
        'DESC',
      );
    } else if (query.sort === 'price-low') {
      qb.orderBy('product.price', 'ASC').addOrderBy(
        'product.createdAt',
        'DESC',
      );
    } else if (query.sort === 'price-high') {
      qb.orderBy('product.price', 'DESC').addOrderBy(
        'product.createdAt',
        'DESC',
      );
    } else {
      qb.orderBy('product.createdAt', 'DESC');
    }

    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

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

  async findOneById(id: number) {
    const product = await this.productRepo.findOne({ where: { id } });

    if (!product) throw new NotFoundException('Product topilmadi!');

    return product;
  }

  async update(
    id: number,
    dto: UpdateProductDto,
    user: { sub: number; role: UserRole },
  ) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product topilmadi!');
    }

    if (
      product.author.id.toString() !== user.sub.toString() &&
      user.role !== UserRole.ADMIN
    ) {
      throw new NotFoundException('Mahsulot sizga tegishli emas!');
    }

    if (dto.categoryId) {
      const category = await this.categoryRepo.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category topilmadi!');
      }
    }

    const updateData: Partial<{
      name: string;
      slug: string;
      categoryId: number;
      price: number;
      description: string;
      images: string[];
    }> = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;
      updateData.slug = await generateUniqueSlug(
        this.productRepo,
        dto.name,
        id,
      );
    }

    if (dto.categoryId !== undefined) {
      updateData.categoryId = dto.categoryId;
    }

    if (dto.price !== undefined) {
      updateData.price = dto.price;
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }

    if (dto.images) {
      updateData.images = dto.images;
    }

    Object.assign(product, updateData);

    const updatedProduct = await this.productRepo.save(product);

    return updatedProduct;
  }

  async allGetByStatus(query: ProductQueryDto, status: ProductStatus) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 12, 1000);
    const search = query.search || '';
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (query.authorId) {
      where.author = { id: Number(query.authorId) };
    }

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const [items, total] = await this.productRepo.findAndCount({
      where,
      relations: ['category', 'author'],
      order: {
        [sortBy]: sortOrder,
      },
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

  async findOnePublic(id: number) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'author'],
    });

    if (!product) throw new NotFoundException('Mahsulot topilmadi!');
    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.productRepo.findOne({
      where: {
        slug,
        status: ProductStatus.APPROVED,
      },
      relations: ['category', 'author'],
    });

    if (!product) {
      throw new NotFoundException('Mahsulot topilmadi!');
    }

    product.viewCount += 1;

    await this.productRepo.save(product);

    return product;
  }

  async create(dto: CreateProductDto, sellerId: number) {
    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId },
    });

    if (!category) throw new NotFoundException('Category topilmadi!');

    const slug = slugify(dto.name, { lower: true, strict: true });

    const exists = await this.productRepo.findOne({
      where: { name: dto.name, slug },
    });

    if (exists) {
      throw new ConflictException('Bunday nomdagi hujjat allaqachon mavjud!');
    }

    const product = this.productRepo.create({
      name: dto.name,
      slug,
      description: dto.description,
      price: dto.price,
      fileKey: dto.fileKey,
      fileExt: dto.fileKey.split('.').pop(),
      category: { id: dto.categoryId },
      author: { id: sellerId },
      status: ProductStatus.PENDING,
    });

    return this.productRepo.save(product);
  }

  async delete(id: number, user: { sub: number; role: UserRole }) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!product) throw new NotFoundException('Product not found');

    if (
      product.author.id.toString() !== user.sub.toString() &&
      user.role !== UserRole.ADMIN
    )
      throw new ForbiddenException(
        "Siz o'zingizni mahsulotingizni o'chirishingiz mumkun!",
      );

    if (product.fileKey) {
      await this.storageService.deleteFile(product.fileKey);
    }

    await this.productRepo.delete(id);

    return { message: "Mahsulot o'chirildi!" };
  }

  async bulkDelete(ids: number[], user: { sub: number; role: UserRole }) {
    const products = await this.productRepo.find({
      where: { id: In(ids) },
      relations: ['author'],
    });

    if (!products.length) {
      throw new NotFoundException('Mahsulotlar topilmadi');
    }

    const productsToDelete = products.filter((product) => {
      if (user.role === UserRole.ADMIN) return true;
      return product.author.id.toString() === user.sub.toString();
    });

    if (productsToDelete.length === 0) {
      throw new ForbiddenException(
        "Sizda ushbu mahsulotlarni o'chirish huquqi yo'q",
      );
    }

    const deleteFilePromises = productsToDelete
      .filter((p) => p.fileKey)
      .map((p) => this.storageService.deleteFile(p.fileKey));

    await Promise.all(deleteFilePromises);

    const idsToDelete = productsToDelete.map((p) => p.id);

    const result = await this.productRepo.delete(idsToDelete);

    return { deletedCount: result.affected ?? 0 };
  }
}
