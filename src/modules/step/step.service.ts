import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateStepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { SupabaseProvider } from '../../config/SupabaseProvider';
import { SupabaseClient } from '@supabase/supabase-js';
import { LoggerService } from '../../shared/services/LoggerService';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import { Step } from '../../types/Step';
import { ResponseStepDto } from './dto/response-step.dto';

@Injectable()
export class StepService {
  constructor(
    private readonly supabaseProvider: SupabaseProvider,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(
    createStepDto: CreateStepDto,
    supabase: SupabaseClient,
  ): Promise<Step> {
    try {
      const { data, error } = await supabase
        .from('ta_step')
        .insert(createStepDto)
        .single();

      if (error) {
        this.logger.error('Error creating step:', error);
        throw new BadRequestException(`Error creating step: ${error.message}`);
      }

      this.logger.info('Step created successfully:', data);
      await this.refreshCache(supabase);
      return data;
    } catch (err) {
      this.logger.error('Unexpected error in create:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating step.',
      );
    }
  }

  async findAll(supabase: SupabaseClient): Promise<ResponseStepDto[]> {
    try {
      const cacheKey = 'step:all';
      const cachedStep = await this.cacheManager.get<Step[]>(cacheKey);
      if (cachedStep) {
        this.logger.info('Returning cached step');
        return plainToInstance(ResponseStepDto, cachedStep);
      }

      const { data, error } = await supabase.from('ta_step').select('*');
      if (error) {
        this.logger.error('Error fetching step:', error);
        throw new BadRequestException(`Error fetching step: ${error.message}`);
      }

      this.logger.info('Step fetched successfully:', data);
      await this.cacheManager.set(cacheKey, data, 0);
      return plainToInstance(ResponseStepDto, data);
    } catch (err) {
      this.logger.error('Unexpected error in findAll:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching steps.',
      );
    }
  }

  async findAllByTravelId(
    id: string,
    supabase: SupabaseClient,
  ): Promise<ResponseStepDto[]> {
    try {
      const cacheKey = `step:travel:${id}`;
      const cachedStep = await this.cacheManager.get<Step[]>(cacheKey);
      if (cachedStep) {
        this.logger.info('Returning cached step');
        return plainToInstance(ResponseStepDto, cachedStep);
      }

      const { data, error } = await supabase
        .from('ta_step')
        .select('*')
        .eq('travel_id', id);

      if (error) {
        this.logger.error('Error fetching step:', error);
        throw new BadRequestException(`Error fetching step: ${error.message}`);
      }

      this.logger.info('Step fetched successfully:', data);
      await this.cacheManager.set(cacheKey, data, 0);
      return plainToInstance(ResponseStepDto, data);
    } catch (err) {
      this.logger.error('Unexpected error in findAllByTravelId:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching steps by travel ID.',
      );
    }
  }

  async findOne(
    id: string,
    supabase: SupabaseClient,
  ): Promise<ResponseStepDto> {
    try {
      const cacheKey = `step:${id}`;
      const cachedStep = await this.cacheManager.get<Step>(cacheKey);
      if (cachedStep) {
        this.logger.info('Returning cached step');
        return plainToInstance(ResponseStepDto, cachedStep);
      }

      const { data, error } = await supabase
        .from('ta_step')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error('Error fetching step:', error);
        throw new BadRequestException(`Error fetching step: ${error.message}`);
      }

      this.logger.info('Step fetched successfully:', data);
      return plainToInstance(ResponseStepDto, data);
    } catch (err) {
      this.logger.error('Unexpected error in findOne:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching step.',
      );
    }
  }

  async update(
    id: string,
    updateStepDto: UpdateStepDto,
    supabase: SupabaseClient,
  ) {
    try {
      const { data, error } = await supabase
        .from('ta_step')
        .update(updateStepDto)
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error('Error updating step:', error);
        throw new BadRequestException(`Error updating step: ${error.message}`);
      }

      this.logger.info('Step updated successfully:', data);
      await this.refreshCache(supabase);
      return plainToInstance(ResponseStepDto, data);
    } catch (err) {
      this.logger.error('Unexpected error in update:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating step.',
      );
    }
  }

  async remove(id: string, supabase: SupabaseClient): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('ta_step')
        .delete()
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error('Error deleting step:', error);
        throw new BadRequestException(`Error deleting step: ${error.message}`);
      }

      this.logger.info('Step deleted successfully:', data);
      await this.refreshCache(supabase);
    } catch (err) {
      this.logger.error('Unexpected error in remove:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting step.',
      );
    }
  }

  async refreshCache(supabase: SupabaseClient): Promise<void> {
    try {
      const { data, error } = await supabase.from('ta_step').select('*');

      if (error) {
        this.logger.error('Error refreshing cache:', error);
        throw new BadRequestException(
          `Error refreshing cache: ${error.message}`,
        );
      }

      this.logger.info('Cache refreshed successfully:', data);

      await this.cacheManager.set('step:all', data, 0);

      for (const step of data) {
        const stepKey = `step:${step.id}`;
        await this.cacheManager.set(stepKey, step, 0);

        const travelKey = `step:travel:${step.travel_id}`;
        const travelSteps =
          (await this.cacheManager.get<Step[]>(travelKey)) || [];
        const updatedTravelSteps = [
          ...travelSteps.filter((s) => s.id !== step.id),
          step,
        ];
        await this.cacheManager.set(travelKey, updatedTravelSteps, 0);
      }
    } catch (err) {
      this.logger.error('Unexpected error in refreshCache:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while refreshing the cache.',
      );
    }
  }
}
