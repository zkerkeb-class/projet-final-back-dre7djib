import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { LoggerService } from '../../shared/services/LoggerService';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import {UserSchema } from '../../schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from '../../schemas/user.schema';
import { SupabaseAdminProvider } from '../../config/SupasbaseAdminProvider';
import { SupabaseProvider } from '../../config/SupabaseProvider';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    LoggerService,
    AuthService,
    JwtService,
    SupabaseAdminProvider,
    SupabaseProvider
  ],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
})
export class UsersModule {}
