import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { User } from '../../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/response-user.dto';

import { LoggerService } from '../../shared/services/LoggerService';
import { AuthService } from '../auth/auth.service';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly logger: LoggerService,
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}



  async create(userDto: CreateUserDto): Promise<void> {
    const cacheKey = 'users:all';
    const cachedUsers = await this.cacheManager.get<User[]>(cacheKey);

    if (cachedUsers?.some((u) => u.email === userDto.email)) {
      this.logger.warn('Email already exists (from cache):', {
        email: userDto.email,
      });
      throw new BadRequestException('Email already exists');
    }

    try {
      const hashedPassword = await bcrypt.hash(userDto.password, 10);
      const user = new this.userModel({
        ...userDto,
        password: hashedPassword,
      });

      await user.save();
      this.logger.info('User created successfully in DB');
      await this.refreshCache();

    } catch (err) {
      this.logger.error('Unexpected error in create:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the user.',
      );
    }
  }



  async findAll(): Promise<UserResponseDto[]> {
    try {
      const cacheKey = 'users:all';
      const cachedUsers = await this.cacheManager.get<User[]>(cacheKey);

      if (cachedUsers) {
        this.logger.info('Returning cached users');
        return plainToInstance(UserResponseDto, cachedUsers);
      }

      const users = await this.userModel.find().lean().exec();
      this.logger.info('Fetched users successfully');

      await this.cacheManager.set(cacheKey, users, 0);
      return plainToInstance(UserResponseDto, users);
    } catch (err) {
      this.logger.error('Unexpected error in findAll:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching users.',
      );
    }
  }



  async findOne(id: string): Promise<UserResponseDto> {
    console.log('findOne called with id:', id);
    try {
      const cacheKey = `users:${id}`;
      const cachedUser = await this.cacheManager.get<User>(cacheKey);

      if (cachedUser) {
        this.logger.info(`Returning cached user with ID: ${id}`);
        return plainToInstance(UserResponseDto, cachedUser);
      }

      const user = await this.userModel.findById(id).lean().exec();

      if (!user) {
        throw new BadRequestException(`User with id ${id} not found`);
      }

      await this.cacheManager.set(cacheKey, user, 0);
      return plainToInstance(UserResponseDto, user);
    } catch (err) {
      this.logger.error('Unexpected error in findOne:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching the user.',
      );
    }
  }


  async update(id: string, updates: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userModel.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true },
      ).lean();
      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new BadRequestException(`User with id ${id} not found`);
      }
      this.logger.info('User updated successfully:', { id });
      await this.cacheManager.set(`users:${id}`, user, 0);
      await this.refreshCache();
      return user;
    } catch (err) {
      this.logger.error('Error updating user:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the user.',
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.userModel.findByIdAndDelete(id).exec();

      this.logger.info('User deleted successfully:', { id });
      await this.cacheManager.del(`users:${id}`);
      await this.refreshCache();
    } catch (err) {
      this.logger.error('Error deleting user:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting the user.',
      );
    }
  }



  async refreshCache(): Promise<void> {
    try {
      const users = await this.userModel.find().exec();
      await this.cacheManager.set('users:all', users, 0);
      this.logger.info('Users cache refreshed');
    } catch (err) {
      this.logger.error('Error refreshing cache:', err);
      throw new Error(`Error refreshing cache: ${err.message}`);
    }
  }
}
