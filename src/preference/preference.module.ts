// src/user-preferences/user-preferences.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserPreferencesController } from './preference.controller';
import { UserPreferencesService } from './preference.service';
import { UserPreferences, UserPreferencesSchema } from '../schemas/preference.schema';
import { LoggerService } from '../shared/services/LoggerService';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserPreferences.name, schema: UserPreferencesSchema }
    ])
  ],
  controllers: [UserPreferencesController],
  providers: [UserPreferencesService, LoggerService, JwtService],
  exports: [UserPreferencesService]
})
export class PreferenceModule {}