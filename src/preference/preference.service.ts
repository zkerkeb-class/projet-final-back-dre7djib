import { Injectable, NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserPreferences, UserPreferencesDocument } from '../schemas/preference.schema';
import { CreateUserPreferencesDto, UpdateUserPreferencesDto } from './dto/create-preference.dto';
import { LoggerService } from '../shared/services/LoggerService';

@Injectable()
export class UserPreferencesService {
  constructor(
    @InjectModel(UserPreferences.name)
    private userPreferencesModel: Model<UserPreferencesDocument>,
    private readonly logger: LoggerService,
  ) {}

  async create(userId: string, createUserPreferencesDto: CreateUserPreferencesDto): Promise<UserPreferences> {
    this.logger.info(`Creating/updating preferences for user: ${userId}`);
    this.logger.info(`DTO received: ${JSON.stringify(createUserPreferencesDto)}`);
    
    const existingPreferences = await this.userPreferencesModel.findOne({ userId: userId }).exec();
    this.logger.info(`Existing preferences: ${JSON.stringify(existingPreferences)}`);
    
    if (existingPreferences) {
      this.logger.info(`Updating existing preferences for user ${userId}`);
      
      const updatedPreferences = await this.userPreferencesModel.findByIdAndUpdate(
        existingPreferences._id,
        { $set: createUserPreferencesDto },
        { new: true }
      ).exec();

      this.logger.info(`Updated preferences: ${JSON.stringify(updatedPreferences)}`);
      
      if (!updatedPreferences) {
        this.logger.error(`Failed to update user preferences for user ${userId}`);
        throw new NotFoundException(`Failed to update user preferences for user ${userId}`);
      }
      
      return updatedPreferences;
    } else {
      this.logger.info(`Creating new preferences for user ${userId}`);
      
      const userPreferences = new this.userPreferencesModel({
        userId: userId,
        ...createUserPreferencesDto,
      });
      
      const savedPreferences = await userPreferences.save();
      this.logger.info(`Created preferences: ${JSON.stringify(savedPreferences)}`);
      
      return savedPreferences;
    }
  }

  async findByUserId(userId: string): Promise<UserPreferences | null> {
    let userPreferences = await this.userPreferencesModel.findOne({ userId: userId }).exec();
    this.logger.info(`User preferences: ${JSON.stringify(userPreferences)}`);
    return userPreferences;
  }

  async update(userId: string, updateUserPreferencesDto: UpdateUserPreferencesDto): Promise<UserPreferences> {
    const userPreferences = await this.userPreferencesModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: updateUserPreferencesDto },
      { new: true, upsert: true }
    ).exec();

    if (!userPreferences) {
      throw new NotFoundException(`User preferences not found for user ${userId}`);
    }

    return userPreferences;
  }

  async upsert(userId: string, createUserPreferencesDto: CreateUserPreferencesDto): Promise<UserPreferences> {
    return this.userPreferencesModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: createUserPreferencesDto },
      { new: true, upsert: true }
    ).exec();
  }

  async delete(userId: string): Promise<void> {
    await this.userPreferencesModel.deleteOne({ userId: new Types.ObjectId(userId) }).exec();
  }
}