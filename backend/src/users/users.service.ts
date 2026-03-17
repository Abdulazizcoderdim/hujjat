import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Product } from 'src/products/schemas/product.schema';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './schema/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async updateProfile(
    id: number,
    updateUserDto: {
      full_name: string;
      email: string;
      password: string;
      new_password: string;
    },
  ) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new Error('Admin topilmadi');
    }
    if (user.role !== UserRole.ADMIN) {
      throw new Error('Admin emas bu foydalanuvchi');
    }

    const hash = await bcrypt.compare(updateUserDto.password, user.password!);

    if (!hash) {
      throw new Error("Parol noto'g'ri");
    }

    const update: any = {};

    if (updateUserDto.full_name) {
      update.full_name = updateUserDto.full_name;
    }
    if (updateUserDto.email) {
      update.email = updateUserDto.email;
    }
    if (updateUserDto.new_password) {
      update.password = await bcrypt.hash(updateUserDto.new_password, 10);
    }

    return this.userRepo.update(user.id, update);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new Error('Admin topilmadi');
    }
    if (user.role !== UserRole.ADMIN) {
      throw new Error('Admin emas bu foydalanuvchi');
    }

    return this.userRepo.update(id, updateUserDto);
  }

  async deleteUser(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new Error('Admin topilmadi');
    }
    if (user.role !== UserRole.ADMIN) {
      throw new Error('Admin emas bu foydalanuvchi');
    }

    return this.userRepo.remove(user);
  }

  async getUsersByRole(role: UserRole, page: number, limit: number) {
    const [items, total] = await this.userRepo.findAndCount({
      where: { role },
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

  async getStats() {
    const totalUsers = await this.userRepo.count();
    const activeUsers = await this.userRepo.count({
      where: { is_active: true },
    });
    const inactiveUsers = await this.userRepo.count({
      where: { is_active: false },
    });
    const adminUsers = await this.userRepo.count({
      where: { role: UserRole.ADMIN },
    });
    const studentUsers = await this.userRepo.count({
      where: { role: UserRole.STUDENT },
    });
    const totalProducts = await this.productRepo.count();

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      studentUsers,
      totalProducts,
    };
  }

  async findAll() {
    return this.userRepo.find();
  }

  async findOne(id: number) {
    return this.userRepo.findOne({ where: { id } });
  }

  async getPublicStat() {
    const userCount = await this.userRepo.count({ where: { is_active: true } });

    const downloadCount = 10;
    const productCount = 10;

    return {
      userCount,
      downloadCount,
      productCount,
    };
  }
}
