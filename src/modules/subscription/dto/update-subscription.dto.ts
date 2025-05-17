import { PartialType } from "@nestjs/mapped-types";
import { CreateSubscriptionDto } from "./create-subscription.dto";
import { IsBoolean, IsOptional } from "class-validator";
import { IsString } from "class-validator";

export class UpdateSubscriptionDto extends PartialType(CreateSubscriptionDto) {
  @IsString()
  @IsOptional()
  user_id: string;

  @IsString()
  @IsOptional()
  stripe_customer_id: string;

  @IsString()
  @IsOptional()
  statut: string;

  @IsString()
  @IsOptional()
  start_date: string;

  @IsString()
  @IsOptional()
  end_date: string;

  @IsBoolean()
  @IsOptional()
  deleted: boolean;

  @IsString()
  @IsOptional()
  created_at: string;
}
