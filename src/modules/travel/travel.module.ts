import { Module } from '@nestjs/common';
import { TravelService } from './travel.service';
import { TravelController } from './travel.controller';
import { SupabaseProvider } from '../../config/SupabaseProvider';
import { LoggerService } from '../../shared/services/LoggerService';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [TravelController],
  providers: [TravelService, SupabaseProvider, LoggerService, JwtService],
})
export class TravelModule {}
