import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseProvider } from './config/SupabaseProvider';
import { UsersModule } from './modules/users/users.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors/LoggerInterceptor';
import { LoggerService } from './shared/services/LoggerService';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from './modules/auth/auth.module';
import { TravelModule } from './modules/travel/travel.module';
import { StepModule } from './modules/step/step.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
    }),
    UsersModule,
    CacheModule.register({
      store: redisStore,
      url: process.env.REDIS_URL,
      isGlobal: true,
      ttl: 60 * 30,
      max: 100,
    }),
    AuthModule,
    TravelModule,
    StepModule,
    SubscriptionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SupabaseProvider,
    LoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
