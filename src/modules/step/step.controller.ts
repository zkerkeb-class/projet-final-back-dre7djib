import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { StepService } from './step.service';
import { CreateStepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { HttpExceptionFilter } from '../../common/filters/HttpExceptionFilter';
import { AuthGuard } from '../../common/guards/AuthGuard';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseDecorator } from '../../common/decorator/SupabaseDecorator';

@Controller('step')
export class StepController {
  constructor(private readonly stepService: StepService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  create(
    @Body() createStepDto: CreateStepDto,
    @SupabaseDecorator() supabase: SupabaseClient,
  ) {
    return this.stepService.create(createStepDto, supabase);
  }

  @Get()
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  findAll(@SupabaseDecorator() supabase: SupabaseClient) {
    return this.stepService.findAll(supabase);
  }

  @Get('travel/:id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  findAllByTravelId(
    @Param('id') id: string,
    @SupabaseDecorator() supabase: SupabaseClient,
  ) {
    return this.stepService.findAllByTravelId(id, supabase);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  findOne(
    @Param('id') id: string,
    @SupabaseDecorator() supabase: SupabaseClient,
  ) {
    return this.stepService.findOne(id, supabase);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  update(
    @Param('id') id: string,
    @Body() updateStepDto: UpdateStepDto,
    @SupabaseDecorator() supabase: SupabaseClient,
  ) {
    return this.stepService.update(id, updateStepDto, supabase);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  remove(
    @Param('id') id: string,
    @SupabaseDecorator() supabase: SupabaseClient,
  ) {
    return this.stepService.remove(id, supabase);
  }
}
