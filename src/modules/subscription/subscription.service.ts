import { Injectable, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SupabaseProvider } from '../../config/SupabaseProvider';
import { LoggerService } from '../../shared/services/LoggerService';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SupabaseClient } from '@supabase/supabase-js';
import { Subscription } from '../../types/Subscription';
import { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import { ResponseSubscriptionDto } from './dto/response-subscription.dto';
import { SupabaseAdminProvider } from '../../config/SupasbaseAdminProvider';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async create(createSubscriptionDto: CreateSubscriptionDto, supabase: SupabaseClient): Promise<Subscription> {
    try {
      const { data, error } = await supabase
        .from('ta_subscription')
        .insert(createSubscriptionDto)
        .single();

      if (error) {
        this.logger.error('Error creating subscription:', error);
        throw new BadRequestException(`Error creating subscription: ${error.message}`);
      }

      this.logger.info('Subscription created successfully:', data);
      await this.refreshCache(supabase);
      return data;
    } catch (err) {
      this.logger.error('Unexpected error in create:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating subscription.',
      );
    }
  }

  async findAll(supabase: SupabaseClient): Promise<ResponseSubscriptionDto[]> {
    try {
      const cacheKey = 'subscription:all';
      const cachedSubscription = await this.cacheManager.get<Subscription[]>(cacheKey);
      if (cachedSubscription) {
        this.logger.info('Returning cached subscription');
        return plainToInstance(ResponseSubscriptionDto, cachedSubscription);
      }

      const { data, error } = await supabase
        .from('ta_subscription')
        .select('*');

      if (error) {
        this.logger.error('Error fetching subscriptions:', error);
        throw new BadRequestException(`Error fetching subscriptions: ${error.message}`);
      }

      await this.cacheManager.set(cacheKey, data, 0);
      return plainToInstance(ResponseSubscriptionDto, data);
    } catch (err) {
      this.logger.error('Unexpected error in findAll:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching subscriptions.',
      );
    }
  }

  async findOne(id: string, supabase: SupabaseClient) : Promise<ResponseSubscriptionDto> {
    try {
      const cacheKey = `subscription:${id}`;
      const cachedSubscription = await this.cacheManager.get<Subscription>(cacheKey);
      if (cachedSubscription) {
        this.logger.info('Returning cached subscription');
        return plainToInstance(ResponseSubscriptionDto, cachedSubscription);
      }

      const { data, error } = await supabase
        .from('ta_subscription')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error('Error fetching subscription:', error);
        throw new BadRequestException(`Error fetching subscription: ${error.message}`);
      }

      await this.cacheManager.set(cacheKey, data, 0);
      return plainToInstance(ResponseSubscriptionDto, data);
    } catch (err) {
      this.logger.error('Unexpected error in findOne:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching subscription.',
      );
    }
  }

  async findOneByUserId(id: string, supabase: SupabaseClient) : Promise<ResponseSubscriptionDto> {
    try {
      const cacheKey = `subscription:user:${id}`;
      const cachedSubscription = await this.cacheManager.get<Subscription>(cacheKey);
      if (cachedSubscription) {
        this.logger.info('Returning cached subscription');
        return plainToInstance(ResponseSubscriptionDto, cachedSubscription);
      }

      const { data, error } = await supabase
        .from('ta_subscription')
        .select('*')
        .eq('user_id', id)
        .single();

      if (error) {
        this.logger.error('Error fetching subscription:', error);
        throw new BadRequestException(`Error fetching subscription: ${error.message}`);
      }

      await this.cacheManager.set(cacheKey, data, 0);
      return plainToInstance(ResponseSubscriptionDto, data);
    } catch (err) {
      this.logger.error('Unexpected error in findOne:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching subscription.',
      );
    }
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto, supabase: SupabaseClient) {
    try{
      const { data, error } = await supabase
        .from('ta_subscription')
        .update(updateSubscriptionDto)
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error('Error updating subscription:', error);
        throw new BadRequestException(`Error updating subscription: ${error.message}`);
      }

      this.logger.info('Subscription updated successfully:', data);
      await this.refreshCache(supabase);
      return plainToInstance(ResponseSubscriptionDto, data);
    } catch (err) {
      this.logger.error('Unexpected error in update:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating subscription.',
      );
    }
  }

  async remove(id: string, supabase: SupabaseClient): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('ta_subscription')
        .delete()
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error('Error deleting subscription:', error);
        throw new BadRequestException(`Error deleting subscription: ${error.message}`);
      }
      this.logger.info('Subscription deleted successfully:', data);
      await this.refreshCache(supabase);
    } catch (err) {
      this.logger.error('Unexpected error in remove:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting subscription.',
      );
    }
    
  }

  async refreshCache(supabase: SupabaseClient) {
    const { data, error } = await supabase
      .from('ta_subscription')
      .select('*');

    if (error) {
      this.logger.error('Error refreshing cache:', error);
      throw new InternalServerErrorException('Error refreshing cache');
    }

    for (const subscription of data) {
      const cacheKey = `subscription:${subscription.id}`;
      await this.cacheManager.set(cacheKey, subscription, 0);

      const userCacheKey = `subscription:user:${subscription.user_id}`;
      await this.cacheManager.set(userCacheKey, subscription, 0);
    }

    await this.cacheManager.set('subscription:all', data, 0);
    this.logger.info('Cache refreshed successfully');
  }
}
