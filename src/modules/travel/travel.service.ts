import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateTravelDto } from './dto/create-travel.dto';
import { UpdateTravelDto } from './dto/update-travel.dto';
import { LoggerService } from '../../shared/services/LoggerService';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import { TravelResponseDto } from './dto/response-travel.dto';
import { Travel } from '../../schemas/travel.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
export class TravelService {
  constructor(
    @InjectModel(Travel.name) private readonly userModel: Model<Travel>,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(
    travel: CreateTravelDto,
  ): Promise<Travel> {
    try {
      this.logger.info('Creating travel:', travel);
      const createdTravel = await this.userModel.create(travel);

      this.logger.info('Travel created successfully:', createdTravel);
      await this.refreshCache();  
      return createdTravel.toObject();
    } catch (err) {
      this.logger.error('Unexpected error in create:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating travel.',
      );
    }
  }

  async findAll(): Promise<TravelResponseDto[]> {
    try {
      const cacheKey = 'travel:all';
      const cachedTravel = await this.cacheManager.get<Travel[]>(cacheKey);
      if (cachedTravel) {
        this.logger.info('Returning cached travel');
        return plainToInstance(TravelResponseDto, cachedTravel);
      }

      const travels = await this.userModel.find().lean().exec();
      this.logger.info('Travel fetched successfully:', travels);

      await this.cacheManager.set(cacheKey, travels, 0);
      return plainToInstance(TravelResponseDto, travels);
    } catch (err) {
      this.logger.error('Unexpected error in findAll:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching travels.',
      );
    }
  }

  async findAllByUserId(userId: string): Promise<TravelResponseDto[]> {
    try {
      const cacheKey = `travel:user:${userId}`;
      const cachedTravel = await this.cacheManager.get<Travel[]>(cacheKey);
      if (cachedTravel) {
        this.logger.info('Returning cached travel');
        return plainToInstance(TravelResponseDto, cachedTravel);
      }

      const travels = await this.userModel.find({ user_id: userId }).lean().exec();

      this.logger.info('Travel fetched successfully:', travels);
      await this.cacheManager.set(cacheKey, travels, 0);
      return plainToInstance(TravelResponseDto, travels);
    } catch (err) {
      this.logger.error('Unexpected error in findAllByUserId:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching travels by user ID.',
      );
    }
  }

  async findOne(id: string): Promise<TravelResponseDto> {
    try {
      const cacheKey = `travel:${id}`;
      const cachedTravel = await this.cacheManager.get<Travel>(cacheKey);
      if (cachedTravel) {
        this.logger.info('Returning cached travel:', cachedTravel);
        return plainToInstance(TravelResponseDto, cachedTravel);
      }

      const travel = await this.userModel.findById(id).lean().exec();

      if (!travel) {
        this.logger.error('Travel not found with id:', {id});
        throw new BadRequestException(
          `Travel not found with id: ${id}`,
        );
      }

      this.logger.info('Travel fetched successfully:', travel);
      await this.cacheManager.set(cacheKey, travel, 0);
      return plainToInstance(TravelResponseDto, travel);
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
  ): Promise<Travel> {
    try {
      const updatedTravel = await this.userModel.findByIdAndUpdate(
        id,
        updateTravelDto,
        { new: true },
      ).exec();

      if (!updatedTravel) {
        this.logger.error('Travel not found with id:', {id});
        throw new BadRequestException(
          `Travel not found with id: ${id}`,
        );
      }

      this.logger.info('Travel updated successfully:', updatedTravel);
      await this.cacheManager.del(`travel:${id}`);
      await this.cacheManager.del('travel:all');
      await this.cacheManager.del(`travel:user:${updatedTravel.get('user_id')}`);
      return updatedTravel;
    } catch (err) {
      this.logger.error('Unexpected error in update:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the travel.',
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const deletedTravel = await this.userModel.findByIdAndDelete(id).exec();

      if (!deletedTravel) {
        this.logger.error('Travel not found with id:', {id});
        throw new BadRequestException(
          `Travel not found with id: ${id}`,
        );
      }

      this.logger.info('Travel deleted successfully:', deletedTravel);
      await this.cacheManager.del(`travel:${id}`);
      await this.cacheManager.del('travel:all');
      await this.cacheManager.del(`travel:user:${deletedTravel.get('user_id')}`);
    } catch (err) {
      this.logger.error('Unexpected error in remove:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting the travel.',
      );
    }
  }

  async refreshCache(): Promise<void> {
    try {
      const travels = await this.userModel.find().exec();

      this.logger.info('Cache refreshed successfully:', travels);
      await this.cacheManager.set('travel:all', travels, 0);

      for (const travel of travels) {
        const travelKey = `travel:${travel._id}`;
        await this.cacheManager.set(travelKey, travel, 0);
      }

      const userTravelsMap = new Map<string, Travel[]>();
      for (const travel of travels) {
        const userId = travel.get('user_id')?.toString();
        if (!userTravelsMap.has(userId)) {
          userTravelsMap.set(userId, []);
        }
        userTravelsMap.get(userId)!.push(travel);
      }
      for (const [userId, userTravels] of userTravelsMap.entries()) {
        const userKey = `travel:user:${userId}`;
        await this.cacheManager.set(userKey, userTravels, 0);
      }
    } catch (err) {
      this.logger.error('Unexpected error in refreshCache:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred while refreshing the cache.',
      );
    }
  }
}
