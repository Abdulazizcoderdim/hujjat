import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentBook } from './schemas/student-book.schema';
import { StudentBookController } from './student-book.controller';
import { StudentBookService } from './student-book.service';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([StudentBook])],
  controllers: [StudentBookController],
  providers: [StudentBookService],
})
export class StudentBookModule {}
