import { Controller, Get, Post, Body, Patch, Param, Delete, UseFilters, UseInterceptors, UseGuards, ClassSerializerInterceptor } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseDecorator } from '../../common/decorator/SupabaseDecorator';
import { AuthGuard } from '../../common/guards/AuthGuard';
import { HttpExceptionFilter } from '../../common/filters/HttpExceptionFilter';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  create(@Body() createSubscriptionDto: CreateSubscriptionDto, @SupabaseDecorator() supabase: SupabaseClient) {
    return this.subscriptionService.create(createSubscriptionDto, supabase);
  }

  @Get()
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  findAll(@SupabaseDecorator() supabase: SupabaseClient) {
    return this.subscriptionService.findAll(supabase);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  findOne(@Param('id') id: string, @SupabaseDecorator() supabase: SupabaseClient) {
    return this.subscriptionService.findOne(id, supabase);
  }

  @Get('user/:id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  findOneByUserId(@Param('id') id: string, @SupabaseDecorator() supabase: SupabaseClient) {
    return this.subscriptionService.findOneByUserId(id, supabase);
  }


  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  update(@Param('id') id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto, @SupabaseDecorator() supabase: SupabaseClient) {
    return this.subscriptionService.update(id, updateSubscriptionDto, supabase);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  remove(@Param('id') id: string, @SupabaseDecorator() supabase: SupabaseClient) {
    return this.subscriptionService.remove(id, supabase);
  }
}
