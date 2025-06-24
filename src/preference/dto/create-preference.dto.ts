import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RoutePreferencesDto {
  @IsOptional()
  showRoutes?: boolean;

  @IsOptional()
  defaultTransportMode?: 'driving' | 'walking' | 'flying';

  @IsOptional()
  autoShowRoutes?: boolean;
}

export class CreateUserPreferencesDto {
  @IsObject()
  @ValidateNested()
  @Type(() => RoutePreferencesDto)
  routePreferences: RoutePreferencesDto;

  @IsOptional()
  @IsObject()
  otherPreferences?: Record<string, any>;
}

export class UpdateUserPreferencesDto extends CreateUserPreferencesDto {}