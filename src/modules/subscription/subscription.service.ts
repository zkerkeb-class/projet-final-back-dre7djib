import { Injectable, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { LoggerService } from '../../shared/services/LoggerService';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import { ResponseSubscriptionDto } from './dto/response-subscription.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from '../../schemas/subscription.schema';


@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<Subscription>,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    try {
      this.logger.info('Creating subscription:', createSubscriptionDto);
      const createdSubscription = await this.subscriptionModel.create(createSubscriptionDto);

      this.logger.info('Subscription created successfully:', createdSubscription);
      await this.refreshCache();
      return createdSubscription.toObject();
    } catch (err) {
      this.logger.error('Unexpected error in create:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating subscription.',
      );
    }
  }

  async findAll(): Promise<ResponseSubscriptionDto[]> {
    try {
      const cacheKey = 'subscription:all';
      const cachedSubscription = await this.cacheManager.get<Subscription[]>(cacheKey);
      if (cachedSubscription) {
        this.logger.info('Returning cached subscription');
        return plainToInstance(ResponseSubscriptionDto, cachedSubscription);
      }

      const subscriptions = await this.subscriptionModel.find().lean().exec();
      this.logger.info('Subscriptions fetched successfully:');

      await this.cacheManager.set(cacheKey, subscriptions, 0);
      return plainToInstance(ResponseSubscriptionDto, subscriptions);
    } catch (err) {
      this.logger.error('Unexpected error in findAll:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching subscriptions.',
      );
    }
  }

  async findOne(id: string): Promise<ResponseSubscriptionDto> {
    try {
      const cacheKey = `subscription:${id}`;
      const cachedSubscription = await this.cacheManager.get<Subscription>(cacheKey);
      if (cachedSubscription) {
        this.logger.info('Returning cached subscription');
        return plainToInstance(ResponseSubscriptionDto, cachedSubscription);
      }

      const subscription = await this.subscriptionModel.findById(id).lean().exec();

      if (!subscription) {
        this.logger.error('Subscription not found with id:', { id });
        throw new BadRequestException(
          `Subscription not found with id: ${id}`,
        );
      }

      this.logger.info('Subscription fetched successfully:');
      await this.cacheManager.set(cacheKey, subscription, 0);
      return plainToInstance(ResponseSubscriptionDto, subscription);
    } catch (err) {
      this.logger.error('Unexpected error in findOne:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching subscription.',
      );
    }
  }

  async findOneByUserId(userId: string): Promise<ResponseSubscriptionDto> {
    try {
      const cacheKey = `subscription:user:${userId}`;
      const cachedSubscription = await this.cacheManager.get<Subscription>(cacheKey);
      if (cachedSubscription) {
        this.logger.info('Returning cached subscription');
        return plainToInstance(ResponseSubscriptionDto, cachedSubscription);
      }

      const subscription = await this.subscriptionModel.findOne({ user_id: userId }).lean().exec();

      if (!subscription) {
        this.logger.error('Subscription not found for user_id:', { userId });
        throw new BadRequestException(
          `Subscription not found for user_id: ${userId}`,
        );
      }

      this.logger.info('Subscription fetched successfully:', subscription);
      await this.cacheManager.set(cacheKey, subscription, 0);
      return plainToInstance(ResponseSubscriptionDto, subscription);
    } catch (err) {
      this.logger.error('Unexpected error in findOneByUserId:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching subscription by user ID.',
      );
    }
  }


  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<ResponseSubscriptionDto> {
    try {
      const updatedSubscription = await this.subscriptionModel.findByIdAndUpdate(
        id,
        updateSubscriptionDto,
        { new: true },
      ).exec();

      if (!updatedSubscription) {
        this.logger.error('Subscription not found with id:', { id });
        throw new BadRequestException(
          `Subscription not found with id: ${id}`,
        );
      }

      this.logger.info('Subscription updated successfully:', updatedSubscription);
      await this.refreshCache();
      return plainToInstance(ResponseSubscriptionDto, updatedSubscription);
    } catch (err) {
      this.logger.error('Unexpected error in update:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating subscription.',
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const deletedSubscription = await this.subscriptionModel.findByIdAndDelete(id).exec();

      if (!deletedSubscription) {
        this.logger.error('Subscription not found with id:', { id });
        throw new BadRequestException(
          `Subscription not found with id: ${id}`,
        );
      }
      this.logger.info('Subscription deleted successfully:', deletedSubscription);
      await this.refreshCache();
    } catch (err) {
      this.logger.error('Unexpected error in remove:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting subscription.',
      );
    }
  }

  async refreshCache(): Promise<void> {
    try {
      const subscriptions = await this.subscriptionModel.find().lean().exec();

      const responseSubscriptions = plainToInstance(ResponseSubscriptionDto, subscriptions);
      await this.cacheManager.set('subscription:all', responseSubscriptions, 0);
      this.logger.info('Cache refreshed successfully');

      for (const subscription of subscriptions) {
        const responseSubscription = plainToInstance(ResponseSubscriptionDto, subscription);
        const cacheKey = `subscription:${subscription._id}`;
        await this.cacheManager.set(cacheKey, responseSubscription, 0);

        const userCacheKey = `subscription:user:${subscription.user_id}`;
        await this.cacheManager.set(userCacheKey, responseSubscription, 0);
      }
    } catch (err) {
      this.logger.error('Unexpected error in refreshCache:', err);
      throw new InternalServerErrorException('Error refreshing cache');
    }
  }
}
