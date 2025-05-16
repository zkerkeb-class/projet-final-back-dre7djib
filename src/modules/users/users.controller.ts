import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HttpExceptionFilter } from '../../common/filters/HttpExceptionFilter';
import { UserResponseDto } from './dto/response-user.dto';
import { AuthGuard } from '../../common/guards/AuthGuard';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseDecorator } from '../../common/decorator/SupabaseDecorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  create(
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  async findAll(
    @SupabaseDecorator() supabase: SupabaseClient,
  ): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll(supabase);
    return users.map((user) => new UserResponseDto(user));
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @SupabaseDecorator() supabase: SupabaseClient,
  ) {
    const user = await this.usersService.findOne(id, supabase);
    return new UserResponseDto({
      ...user,
      user_id: user.user_id.toString(),
      created_at: new Date(user.created_at),
    });
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @SupabaseDecorator() supabase: SupabaseClient,
  ) {
    return this.usersService.update(id, updateUserDto, supabase);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  remove(
    @Param('id') id: string,
    @SupabaseDecorator() supabase: SupabaseClient,
  ) {
    return this.usersService.remove(id, supabase);
  }
}
