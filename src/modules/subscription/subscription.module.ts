import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { LoggerService } from '../../shared/services/LoggerService';
import { JwtService } from '@nestjs/jwt';
import { SupabaseAdminProvider } from '../../config/SupasbaseAdminProvider';
import { SupabaseProvider } from '../../config/SupabaseProvider';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, LoggerService, JwtService, SupabaseAdminProvider, SupabaseProvider],
})
export class SubscriptionModule {}
