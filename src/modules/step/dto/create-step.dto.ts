import { IsJSON, IsOptional, IsString } from 'class-validator';

export class CreateStepDto {
  @IsString()
  travel_id: string;

  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  place: string;

  @IsString()
  @IsOptional()
  start_date: string;

  @IsString()
  @IsOptional()
  end_date: string;

  @IsJSON()
  @IsOptional()
  metadata_fields: object;
}
