import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserBookDto } from './dto/create-user-book.dto';
import { UpdateUserBookDto } from './dto/update-user-book.dto';
import { StudentBook } from './schemas/student-book.schema';

@Injectable()
export class StudentBookService {
  constructor(
    @InjectRepository(StudentBook)
    private readonly repo: Repository<StudentBook>,
  ) {}

  async create(userId: number, dto: CreateUserBookDto) {
    const existing = await this.repo.findOne({
      where: { user_id: userId, product_id: dto.bookId },
    });

    if (existing) return existing;

    const userBook = this.repo.create({
      user_id: userId,
      product_id: dto.bookId,
    });

    return this.repo.save(userBook);
  }

  async findAllByUser(userId: number) {
    return this.repo.find({
      where: { user_id: userId },
      relations: ['product'],
      order: { updatedAt: 'DESC' },
    });
  }

  async update(id: number, dto: UpdateUserBookDto) {
    const userBook = await this.repo.findOneBy({ id });
    if (!userBook) throw new NotFoundException('Progress topilmadi');

    if (dto.progress === 100) {
      dto.isFinished = true;
    }

    Object.assign(userBook, dto);
    return this.repo.save(userBook);
  }
}
