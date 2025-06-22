import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { CreateStepDto } from "./dto/create-step.dto";
import { UpdateStepDto } from "./dto/update-step.dto";
import { LoggerService } from "../../shared/services/LoggerService";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { plainToInstance } from "class-transformer";
import { Step } from "../../schemas/step.schema";
import { ResponseStepDto } from "./dto/response-step.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class StepService {
  constructor(
    @InjectModel(Step.name) private readonly stepModel: Model<Step>,
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createStepDto: CreateStepDto): Promise<Step> {
    try {
      this.logger.info("Creating step:", createStepDto);
      const createdStep = await this.stepModel.create(createStepDto);

      this.logger.info("Step created successfully:", createdStep);
      await this.refreshCache();
      return createdStep.toObject();
    } catch (err) {
      this.logger.error("Unexpected error in create:", err);
      throw new InternalServerErrorException(
        "An unexpected error occurred while creating step.",
      );
    }
  }

  async findAll(): Promise<ResponseStepDto[]> {
    try {
      const cacheKey = "step:all";
      const cachedStep = await this.cacheManager.get<Step[]>(cacheKey);
      if (cachedStep) {
        this.logger.info("Returning cached step");
        return plainToInstance(ResponseStepDto, cachedStep);
      }

      const steps = await this.stepModel.find().lean().exec();
      this.logger.info("Step fetched successfully:", steps);

      await this.cacheManager.set(cacheKey, steps, 0);
      return plainToInstance(ResponseStepDto, steps);
    } catch (err) {
      this.logger.error("Unexpected error in findAll:", err);
      throw new InternalServerErrorException(
        "An unexpected error occurred while fetching steps.",
      );
    }
  }

  async findAllByTravelId(travelId: string): Promise<ResponseStepDto[]> {
    try {
      const cacheKey = `step:travel:${travelId}`;
      const cachedStep = await this.cacheManager.get<Step[]>(cacheKey);
      if (cachedStep) {
        this.logger.info("Returning cached step");
        return plainToInstance(ResponseStepDto, cachedStep);
      }

      const steps = await this.stepModel
        .find({ travel_id: travelId })
        .sort({ start_date: 1 })
        .lean()
        .exec();
      this.logger.info("Step fetched successfully:", steps);

      await this.cacheManager.set(cacheKey, steps, 0);
      return plainToInstance(ResponseStepDto, steps);
    } catch (err) {
      this.logger.error("Unexpected error in findAllByTravelId:", err);
      throw new InternalServerErrorException(
        "An unexpected error occurred while fetching steps by travel ID.",
      );
    }
  }

  async findOne(id: string): Promise<ResponseStepDto> {
    try {
      const cacheKey = `step:${id}`;
      const cachedStep = await this.cacheManager.get<Step>(cacheKey);
      if (cachedStep) {
        this.logger.info("Returning cached step");
        return plainToInstance(ResponseStepDto, cachedStep);
      }

      const step = await this.stepModel.findById(id).lean().exec();

      if (!step) {
        this.logger.error("Step not found with id:", { id });
        throw new BadRequestException(`Step not found with id: ${id}`);
      }

      this.logger.info("Step fetched successfully:", step);
      await this.cacheManager.set(cacheKey, step, 0);
      return plainToInstance(ResponseStepDto, step);
    } catch (err) {
      this.logger.error("Unexpected error in findOne:", err);
      throw new InternalServerErrorException(
        "An unexpected error occurred while fetching step.",
      );
    }
  }

  async update(
    id: string,
    updateStepDto: UpdateStepDto,
  ): Promise<ResponseStepDto> {
    try {
      const updatedStep = await this.stepModel
        .findByIdAndUpdate(id, updateStepDto, { new: true })
        .lean()
        .exec();

      if (!updatedStep) {
        this.logger.error("Step not found with id:", { id });
        throw new BadRequestException(`Step not found with id: ${id}`);
      }

      this.logger.info("Step updated successfully:", updatedStep);
      await this.refreshCache();
      return plainToInstance(ResponseStepDto, updatedStep);
    } catch (err) {
      this.logger.error("Unexpected error in update:", err);
      throw new InternalServerErrorException(
        "An unexpected error occurred while updating step.",
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const deletedStep = await this.stepModel
        .findByIdAndDelete(id)
        .lean()
        .exec();

      if (!deletedStep) {
        this.logger.error("Step not found with id:", { id });
        throw new BadRequestException(`Step not found with id: ${id}`);
      }

      this.logger.info("Step deleted successfully:", deletedStep);
      await this.refreshCache();
    } catch (err) {
      this.logger.error("Unexpected error in remove:", err);
      throw new InternalServerErrorException(
        "An unexpected error occurred while deleting step.",
      );
    }
  }

  async refreshCache(): Promise<void> {
    try {
      const steps = await this.stepModel.find().lean().exec();

      this.logger.info("Cache refreshed successfully:", steps);
      await this.cacheManager.set("step:all", steps, 0);

      for (const step of steps) {
        const stepKey = `step:${step._id}`;
        await this.cacheManager.set(stepKey, step, 0);
      }

      const travelStepsMap = new Map<string, Step[]>();
      for (const step of steps) {
        const travelId = step.travel_id?.toString();
        if (!travelStepsMap.has(travelId)) {
          travelStepsMap.set(travelId, []);
        }
        travelStepsMap.get(travelId)!.push(step);
      }
      for (const [travelId, travelSteps] of travelStepsMap.entries()) {
        const travelKey = `step:travel:${travelId}`;
        await this.cacheManager.set(travelKey, travelSteps, 0);
      }
    } catch (err) {
      this.logger.error("Unexpected error in refreshCache:", err);
      throw new InternalServerErrorException(
        "An unexpected error occurred while refreshing the cache.",
      );
    }
  }
}
