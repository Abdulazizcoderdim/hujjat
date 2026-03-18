import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateUserBookDto } from './dto/create-user-book.dto';
import { UpdateUserBookDto } from './dto/update-user-book.dto';
import { StudentBookService } from './student-book.service';

@Controller('student-book')
export class StudentBookController {
  constructor(private readonly studentBookService: StudentBookService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createUserBookDto: CreateUserBookDto,
    @CurrentUser('sub') id: number,
  ) {
    return this.studentBookService.create(id, createUserBookDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser('sub') id: number) {
    return this.studentBookService.findAllByUser(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserBookDto: UpdateUserBookDto,
  ) {
    return this.studentBookService.update(+id, updateUserBookDto);
  }
}
