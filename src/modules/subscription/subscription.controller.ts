import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseFilters,
  UseInterceptors,
  UseGuards,
  ClassSerializerInterceptor,
} from "@nestjs/common";
import { SubscriptionService } from "./subscription.service";
import { CreateSubscriptionDto } from "./dto/create-subscription.dto";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto";
import { AuthGuard } from "../../common/guards/AuthGuard";
import { HttpExceptionFilter } from "../../common/filters/HttpExceptionFilter";

@Controller("subscription")
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionService.create(createSubscriptionDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  findAll() {
    return this.subscriptionService.findAll();
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  findOne(@Param("id") id: string) {
    return this.subscriptionService.findOne(id);
  }

  @Get("user/:id")
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  findOneByUserId(@Param("id") id: string) {
    return this.subscriptionService.findOneByUserId(id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  update(
    @Param("id") id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionService.update(id, updateSubscriptionDto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(new HttpExceptionFilter())
  remove(@Param("id") id: string) {
    return this.subscriptionService.remove(id);
  }
}
