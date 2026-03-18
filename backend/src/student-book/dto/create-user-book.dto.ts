import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateUserBookDto {
  @IsNumber()
  @IsNotEmpty()
  bookId: number;
}
