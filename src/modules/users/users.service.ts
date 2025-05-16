import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '../../types/User';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PostgrestSingleResponse } from '@supabase/postgrest-js';
import { LoggerService } from '../../shared/services/LoggerService';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserResponseDto } from './dto/response-user.dto';
import { plainToInstance } from 'class-transformer';
import { AuthService } from '../auth/auth.service';
import { SupabaseAdminProvider } from '../../config/SupasbaseAdminProvider';

@Injectable()
export class UsersService {
  private readonly supabaseAdmin: SupabaseClient;
  constructor(
    private readonly supabaseAdminProvider: SupabaseAdminProvider,
    private readonly logger: LoggerService,
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.supabaseAdmin = this.supabaseAdminProvider.getClient();
  }

  async create(user: CreateUserDto): Promise<User> {
    const cacheKey = 'users:all';
    const cachedUsers = await this.cacheManager.get<User[]>(cacheKey);
    let response;

    if (cachedUsers) {
      const userExists = cachedUsers.some(
        (cachedUser) => cachedUser.email === user.email,
      );
      if (userExists) {
        this.logger.warn('Email already exists (from cache):', {
          email: user.email,
        });
        throw new BadRequestException('Email already exists');
      }
    }

    try {
      response = await this.authService.createUser(user.email, user.password);
      user.user_id = response.user.id;
      this.logger.info('User created successfully in auth service:');

      const { password, ...userWithoutPassword } = user;
      console.log('User without password:', userWithoutPassword);

      const { data, error } = await this.supabaseAdmin
        .from('ta_users')
        .insert(userWithoutPassword)
        .single();

      if (error) {
        this.logger.error('Error creating user:', error);
        throw new BadRequestException(`Error creating user: ${error.message}`);
      }

      this.logger.info('User created successfully:', data);
      await this.refreshCache();
      return data;
    } catch (err) {
      this.logger.error('Unexpected error in create:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the user.',
      );
    }
  }

  async findAll(supabase: SupabaseClient): Promise<UserResponseDto[]> {
    try {
      const cacheKey = 'users:all';
      const cachedUsers = await this.cacheManager.get<User[]>(cacheKey);
      if (cachedUsers) {
        this.logger.info('Returning cached users');
        return plainToInstance(UserResponseDto, cachedUsers);
      }

      const { data, error } = await supabase.from('ta_users').select('*');
      if (error) {
        this.logger.error('Error fetching users:', error);
        throw new BadRequestException(`Error fetching users: ${error.message}`);
      }

      this.logger.info('Fetched users successfully:', data);
      await this.cacheManager.set(cacheKey, data, 0);
      return plainToInstance(UserResponseDto, data);
    } catch (err) {
      this.logger.error('Unexpected error in findAll:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching users.',
      );
    }
  }

  async findOne(
    id: string,
    supabase: SupabaseClient,
  ): Promise<UserResponseDto> {
    try {
      const cacheKey = `users:${id}`;
      const cachedUser = await this.cacheManager.get<User>(cacheKey);
      if (cachedUser) {
        this.logger.info(`Returning cached user with ID: ${id}`);
        return plainToInstance(UserResponseDto, cachedUser);
      }

      const response: PostgrestSingleResponse<User> = await supabase
        .from('ta_users')
        .select('*')
        .eq('user_id', id)
        .single();

      const { data, error } = response;
      if (error) {
        this.logger.error('Error fetching user:', error);
        throw new BadRequestException(
          `Error fetching user with id ${id}: ${error.message}`,
        );
      }

      this.logger.info('Fetched user successfully:', data);
      await this.cacheManager.set(cacheKey, data, 0);
      return plainToInstance(UserResponseDto, data);
    } catch (err) {
      this.logger.error('Unexpected error in findOne:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching the user.',
      );
    }
  }

  async update(
    id: string,
    updates: UpdateUserDto,
    supabase: SupabaseClient,
  ): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('ta_users')
        .update(updates)
        .eq('user_id', id)
        .single();

      if (error) {
        this.logger.error('Error updating user:', error);
        throw new BadRequestException(`Error updating user: ${error.message}`);
      }

      if (updates.email || updates.password) {
        const authUpdates: { email?: string; password?: string } = {};
        if (updates.email) {
          authUpdates.email = updates.email;
        }
        if (updates.password) {
          authUpdates.password = updates.password;
        }

        const { data: authData, error: authError } = await this.supabaseAdmin.auth.admin.updateUserById(id, authUpdates);

        if (authError) {
          this.logger.error('Error updating user in auth service:', authError);
          throw new BadRequestException(`Error updating user in auth service: ${authError.message}`);
        }

        this.logger.info('User updated successfully in auth service:', authData);
      }

      this.logger.info('User updated successfully:', data);
      await this.cacheManager.del(`users:${id}`);
      await this.refreshCache();
      return data;
    } catch (err) {
      this.logger.error('Unexpected error in update:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the user.',
      );
    }
  }

  async remove(id: string, supabase: SupabaseClient): Promise<void> {
    try {
      await this.authService.deleteUser(id);
    } catch (error) {
      this.logger.error('Error deleting user in auth service:', error);
      throw new Error(`Error deleting user in auth service: ${error.message}`);
    }
    this.logger.info('User deleted successfully:', { id });
    await this.refreshCache();
  }

  async refreshCache(): Promise<void> {
    const { data, error } = await this.supabaseAdmin
      .from('ta_users')
      .select('*');
    if (error) {
      this.logger.error('Error refreshing users cache:', error);
      throw new Error(`Error refreshing users cache: ${error.message}`);
    }
    this.logger.info('Refreshing users cache with latest data');
    await this.cacheManager.set('users:all', data, 0);
  }
}
