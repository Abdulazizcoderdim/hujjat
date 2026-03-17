import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export class DashboardQueryDto {
  @IsOptional()
  @IsIn(['today', 'week', 'days', 'month', 'year'])
  period?: 'today' | 'week' | 'days' | 'month' | 'year';

  @IsOptional()
  @IsNumberString()
  days?: string; // "7" "14" "30"

  @IsOptional()
  @IsString()
  month?: string; // "2026-01"

  @IsOptional()
  @IsNumberString()
  year?: string; // "2026"
}
