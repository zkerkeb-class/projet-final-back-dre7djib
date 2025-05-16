import { IsOptional, IsString } from 'class-validator';

export class CreateTravelDto {
  @IsString()
  user_id: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  start_date: string;

  @IsOptional()
  end_date: string;
}
