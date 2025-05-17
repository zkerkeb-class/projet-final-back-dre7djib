import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { LoggerService } from "../../shared/services/LoggerService";
import { AuthService } from "../auth/auth.service";
import { JwtService } from "@nestjs/jwt";
import { UserSchema } from "../../schemas/user.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { User } from "../../schemas/user.schema";

@Module({
  controllers: [UsersController],
  providers: [UsersService, LoggerService, AuthService, JwtService],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
})
export class UsersModule {}
