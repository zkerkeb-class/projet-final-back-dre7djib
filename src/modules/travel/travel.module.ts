import { Module } from '@nestjs/common';
import { TravelService } from './travel.service';
import { TravelController } from './travel.controller';
import { SupabaseProvider } from '../../config/SupabaseProvider';
import { LoggerService } from '../../shared/services/LoggerService';
import { JwtService } from '@nestjs/jwt';
import { Travel } from '../../schemas/travel.schema';
import { TravelSchema } from '../../schemas/travel.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [TravelController],
  providers: [TravelService, SupabaseProvider, LoggerService, JwtService],
  imports: [
    MongooseModule.forFeature([{ name: Travel.name, schema: TravelSchema }]),
  ],
})
export class TravelModule {}
