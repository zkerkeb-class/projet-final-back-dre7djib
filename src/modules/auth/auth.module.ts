import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseProvider } from '../../config/SupabaseProvider';
import { LoggerService } from '../../shared/services/LoggerService';
import { SupabaseAdminProvider } from '../../config/SupasbaseAdminProvider';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    SupabaseProvider,
    LoggerService,
    SupabaseAdminProvider,
  ],
})
export class AuthModule {}
