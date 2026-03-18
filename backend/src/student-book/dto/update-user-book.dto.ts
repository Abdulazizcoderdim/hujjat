import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateUserBookDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsNumber()
  @IsOptional()
  lastPage?: number;

  @IsBoolean()
  @IsOptional()
  isFinished?: boolean;
}
