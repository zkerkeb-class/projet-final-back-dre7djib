import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { HttpExceptionFilter } from "./common/filters/HttpExceptionFilter";
import { UseFilters } from "@nestjs/common";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseFilters(new HttpExceptionFilter())
  getHello(): string {
    return this.appService.getHello();
  }
}
