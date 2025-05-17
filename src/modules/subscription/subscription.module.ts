import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { LoggerService } from '../../shared/services/LoggerService';
import { JwtService } from '@nestjs/jwt';
import { SupabaseAdminProvider } from '../../config/SupasbaseAdminProvider';
import { SupabaseProvider } from '../../config/SupabaseProvider';
import { Subscription } from '../../schemas/subscription.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionSchema } from '../../schemas/subscription.schema';


@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, LoggerService, JwtService, SupabaseAdminProvider, SupabaseProvider],
  imports: [
    MongooseModule.forFeature([{ name: Subscription.name, schema: SubscriptionSchema }]),
  ],
})
export class SubscriptionModule {}
