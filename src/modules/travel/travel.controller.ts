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
    @Body() createTravelDto: CreateTravelDto,
    @SupabaseDecorator() supabase: SupabaseClient,
  ) {
    return this.travelService.create(createTravelDto, supabase);
  }

  @Get()
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  findAll(@SupabaseDecorator() supabase: SupabaseClient) {
    return this.travelService.findAll(supabase);
  }

  @Get('user/:id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  findAllByUserId(
    @Param('id') id: string,
    @SupabaseDecorator() supabase: SupabaseClient,
  ) {
    return this.travelService.findAllByUserId(id, supabase);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  findOne(
    @Param('id') id: string,
    @SupabaseDecorator() supabase: SupabaseClient,
  ) {
    return this.travelService.findOne(id, supabase);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(ClassSerializerInterceptor)
  update(
    @Param('id') id: string,
    @Body() updateTravelDto: UpdateTravelDto,
    @SupabaseDecorator() supabase: SupabaseClient,
  ) {
    return this.travelService.update(id, updateTravelDto, supabase);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  remove(
    @Param('id') id: string,
    @SupabaseDecorator() supabase: SupabaseClient,
  ) {
    return this.travelService.remove(id, supabase);
  }
}
