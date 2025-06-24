// src/user-preferences/user-preferences.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UserPreferencesService } from './preference.service';
import { CreateUserPreferencesDto, UpdateUserPreferencesDto } from './dto/create-preference.dto';
import { AuthGuard } from 'src/common/guards/AuthGuard';

@Controller('user-preferences')
@UseGuards(AuthGuard)
export class UserPreferencesController {
  constructor(private readonly userPreferencesService: UserPreferencesService) {}

  @Post()
  async create(@Request() req, @Body() createUserPreferencesDto: CreateUserPreferencesDto) {
    return this.userPreferencesService.create(req.body.userId, createUserPreferencesDto);
  }

  @Get(':userId')
  async findByUserId(@Param('userId') userId: string) {
    const preferences = await this.userPreferencesService.findByUserId(userId);
    if (!preferences) {
      return {
        routePreferences: {
          showRoutes: false,
          defaultTransportMode: 'driving',
          autoShowRoutes: false
        },
        otherPreferences: {}
      };
    }
    return preferences;
  }

  @Put()
  async update(@Request() req, @Body() updateUserPreferencesDto: UpdateUserPreferencesDto) {
    return this.userPreferencesService.update(req.body.userId, updateUserPreferencesDto);
  }

  @Delete()
  async delete(@Request() req) {
    return this.userPreferencesService.delete(req.body.userId);
  }

  @Post('upsert')
  async upsert(@Request() req, @Body() createUserPreferencesDto: CreateUserPreferencesDto) {
    return this.userPreferencesService.upsert(req.body.userId, createUserPreferencesDto);
  }
}