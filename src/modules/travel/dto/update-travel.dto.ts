import { PartialType } from "@nestjs/mapped-types";
import { CreateTravelDto } from "./create-travel.dto";
import { IsOptional, IsString } from "class-validator";

export class UpdateTravelDto extends PartialType(CreateTravelDto) {
  @IsOptional()
  update_at?: Date;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  user_id: string;

  @IsString()
  @IsOptional()
  status?: string;
}
