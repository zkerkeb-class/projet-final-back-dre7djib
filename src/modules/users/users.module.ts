import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SupabaseProvider } from '../../config/SupabaseProvider';
import { LoggerService } from '../../shared/services/LoggerService';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { SupabaseAdminProvider } from '../../config/SupasbaseAdminProvider';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    SupabaseProvider,
    SupabaseAdminProvider,
    LoggerService,
    AuthService,
    JwtService,
  ],
})
export class UsersModule {}
