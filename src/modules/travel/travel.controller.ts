import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import { TravelService } from './travel.service';
import { CreateTravelDto } from './dto/create-travel.dto';
import { UpdateTravelDto } from './dto/update-travel.dto';
import { HttpExceptionFilter } from '../../common/filters/HttpExceptionFilter';
import { AuthGuard } from '../../common/guards/AuthGuard';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseDecorator } from '../../common/decorator/SupabaseDecorator';

@Controller('travel')
export class TravelController {
  constructor(private readonly travelService: TravelService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  create(
    @Body() createTravelDto: CreateTravelDto
  ) {
    return this.travelService.create(createTravelDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  findAll() {
    return this.travelService.findAll();
  }

  @Get('user/:id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  findAllByUserId(
    @Param('id') id: string
  ) {
    return this.travelService.findAllByUserId(id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  findOne(
    @Param('id') id: string
  ) {
    return this.travelService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(ClassSerializerInterceptor)
  update(
    @Param('id') id: string,
    @Body() updateTravelDto: UpdateTravelDto
  ) {
    return this.travelService.update(id, updateTravelDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  remove(
    @Param('id') id: string
  ) {
    return this.travelService.remove(id);
  }
}
