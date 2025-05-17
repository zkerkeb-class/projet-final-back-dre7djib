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
  UseGuards,
  UseFilters,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { HttpExceptionFilter } from "../../common/filters/HttpExceptionFilter";
import { UserResponseDto } from "./dto/response-user.dto";
import { AuthGuard } from "../../common/guards/AuthGuard";
import { ParseMongoIdPipe } from "../../common/pipe/ParseMongoIdPipe";

@Controller("users")
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new HttpExceptionFilter())
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    await this.usersService.create(createUserDto);
    return { message: "User created successfully" };
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll();
    return users.map((user) => new UserResponseDto(user));
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  async findOne(
    @Param("id", ParseMongoIdPipe) id: string,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(id);
    return new UserResponseDto(user);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  async update(
    @Param("id", ParseMongoIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.update(id, updateUserDto);
    return new UserResponseDto(user);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  async remove(@Param("id", ParseMongoIdPipe) id: string) {
    await this.usersService.remove(id);
    return { message: "User deleted successfully" };
  }
}
