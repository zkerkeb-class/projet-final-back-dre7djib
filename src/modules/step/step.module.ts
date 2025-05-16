import { Module } from '@nestjs/common';
import { StepService } from './step.service';
import { StepController } from './step.controller';
import { SupabaseProvider } from '../../config/SupabaseProvider';
import { LoggerService } from '../../shared/services/LoggerService';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [StepController],
  providers: [StepService, SupabaseProvider, LoggerService, JwtService],
})
export class StepModule {}
