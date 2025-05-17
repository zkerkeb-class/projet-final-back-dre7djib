import { IsBoolean, IsEmail, IsOptional, IsString } from "class-validator";

export class CreateUserDto {
  @IsString()
  user_id: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsBoolean()
  @IsOptional()
  subscription?: boolean;
}
