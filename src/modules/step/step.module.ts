import { Module } from "@nestjs/common";
import { StepService } from "./step.service";
import { StepController } from "./step.controller";
import { LoggerService } from "../../shared/services/LoggerService";
import { JwtService } from "@nestjs/jwt";
import { Step } from "../../schemas/step.schema";
import { StepSchema } from "../../schemas/step.schema";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  controllers: [StepController],
  providers: [StepService, LoggerService, JwtService],
  imports: [
    MongooseModule.forFeature([{ name: Step.name, schema: StepSchema }]),
  ],
})
export class StepModule {}
