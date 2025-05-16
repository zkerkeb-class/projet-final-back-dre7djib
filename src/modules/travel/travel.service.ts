import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateTravelDto } from './dto/create-travel.dto';
import { UpdateTravelDto } from './dto/update-travel.dto';
import { SupabaseProvider } from '../../config/SupabaseProvider';
import { SupabaseClient } from '@supabase/supabase-js';
import { LoggerService } from '../../shared/services/LoggerService';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import { Travel } from 'src/types/Travel';
import { TravelResponseDto } from './dto/response-travel.dto';

@Injectable()
export class TravelService {
  constructor(
    private readonly supabaseProvider: SupabaseProvider,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(
    travel: CreateTravelDto,
    supabase: SupabaseClient,
  ): Promise<Travel> {
    try {
      console.log('Creating travel:', travel);
      const { data, error } = await supabase
        .from('ta_travels')
        .insert(travel)
        .single();

      if (error) {
        this.logger.error('Error creating travel:', error);
        throw new BadRequestException(
          `Error creating travel: ${error.message}`,
        );
      }

      this.logger.info('Travel created successfully:', data);
      await this.refreshCache(supabase);
      return data;
    } catch (err) {
      this.logger.error('Unexpected error in create:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating travel.',
      );
    }
  }

  async findAll(supabase: SupabaseClient) {
    try {
      const cacheKey = 'travel:all';
      const cachedTravel = await this.cacheManager.get(cacheKey);
      if (cachedTravel) {
        this.logger.info('Returning cached travel');
        return cachedTravel;
      }

      const { data, error } = await supabase.from('ta_travels').select('*');
      if (error) {
        this.logger.error('Error fetching travel:', error);
        throw new BadRequestException(
          `Error fetching travel: ${error.message}`,
        );
      }

      this.logger.info('Travel fetched successfully:', data);
      await this.cacheManager.set(cacheKey, data, 0);
      return plainToInstance(CreateTravelDto, data);
    } catch (err) {
      this.logger.error('Unexpected error in findAll:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching travels.',
      );
    }
  }

  async findAllByUserId(userId: string, supabase: SupabaseClient) {
    try {
      const cacheKey = `travel:user:${userId}`;
      const cachedTravel = await this.cacheManager.get(cacheKey);
      if (cachedTravel) {
        this.logger.info('Returning cached travel');
        return cachedTravel;
      }

      const { data, error } = await supabase
        .from('ta_travels')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        this.logger.error('Error fetching travel:', error);
        throw new BadRequestException(
          `Error fetching travel: ${error.message}`,
        );
      }

      this.logger.info('Travel fetched successfully:', data);
      await this.cacheManager.set(cacheKey, data, 0);
      return plainToInstance(CreateTravelDto, data);
    } catch (err) {
      this.logger.error('Unexpected error in findAllByUserId:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching travels by user ID.',
      );
    }
  }

  async findOne(id: string, supabase: SupabaseClient) {
    try {
      const cacheKey = `travel:${id}`;
      const cachedTravel = await this.cacheManager.get(cacheKey);
      if (cachedTravel) {
        this.logger.info('Returning cached travel:', cachedTravel);
        return cachedTravel;
      }

      const { data, error } = await supabase
        .from('ta_travels')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error('Error fetching travel:', error);
        throw new BadRequestException(
          `Error fetching travel: ${error.message}`,
        );
      }

      this.logger.info('Travel fetched successfully:', data);
      await this.cacheManager.set(cacheKey, data, 0);
      return plainToInstance(TravelResponseDto, data);
    } catch (err) {
      this.logger.error('Unexpected error in findOne:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching the travel.',
      );
    }
  }

  async update(
    id: string,
    updateTravelDto: UpdateTravelDto,
    supabase: SupabaseClient,
  ) {
    try {
      const { data, error } = await supabase
        .from('ta_travels')
        .update(updateTravelDto)
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error('Error updating travel:', error);
        throw new BadRequestException(
          `Error updating travel: ${error.message}`,
        );
      }

      this.logger.info('Travel updated successfully:', data);
      await this.cacheManager.del(`travel:${id}`);
      await this.refreshCache(supabase);
      return data;
    } catch (err) {
      this.logger.error('Unexpected error in update:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the travel.',
      );
    }
  }

  async remove(id: string, supabase: SupabaseClient): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('ta_travels')
        .delete()
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error('Error deleting travel:', error);
        throw new BadRequestException(
          `Error deleting travel: ${error.message}`,
        );
      }

      this.logger.info('Travel deleted successfully:', data);
      await this.cacheManager.del(`travel:${id}`);
      await this.refreshCache(supabase);
    } catch (err) {
      this.logger.error('Unexpected error in remove:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting the travel.',
      );
    }
  }

  async refreshCache(supabase: SupabaseClient): Promise<void> {
    try {
      const { data, error } = await supabase.from('ta_travels').select('*');

      if (error) {
        this.logger.error('Error refreshing cache:', error);
        throw new BadRequestException(
          `Error refreshing cache: ${error.message}`,
        );
      }

      this.logger.info('Cache refreshed successfully:', data);
      await this.cacheManager.set('travel:all', data, 0);

      for (const travel of data) {
        const travelKey = `travel:${travel.id}`;
        await this.cacheManager.set(travelKey, travel, 0);

        const userKey = `travel:user:${travel.user_id}`;
        await this.cacheManager.set(userKey, travel, 0);
      }
    } catch (err) {
      this.logger.error('Unexpected error in refreshCache:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while refreshing the cache.',
      );
    }
  }
}
