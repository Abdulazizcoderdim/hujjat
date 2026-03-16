import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './schema/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

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
