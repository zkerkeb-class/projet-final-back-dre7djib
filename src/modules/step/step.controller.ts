import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { StepService } from './step.service';
import { CreateStepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { HttpExceptionFilter } from '../../common/filters/HttpExceptionFilter';
import { AuthGuard } from '../../common/guards/AuthGuard';

@Controller('step')
export class StepController {
  constructor(private readonly stepService: StepService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  create(
    @Body() createStepDto: CreateStepDto
  ) {
    return this.stepService.create(createStepDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  findAll() {
    return this.stepService.findAll();
  }

  @Get('travel/:id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  findAllByTravelId(
    @Param('id') id: string
  ) {
    return this.stepService.findAllByTravelId(id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  findOne(
    @Param('id') id: string
  ) {
    return this.stepService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  update(
    @Param('id') id: string,
    @Body() updateStepDto: UpdateStepDto
  ) {
    return this.stepService.update(id, updateStepDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  remove(
    @Param('id') id: string
  ) {
    return this.stepService.remove(id);
  }
}
