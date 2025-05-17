import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { LoggerService } from "../../shared/services/LoggerService";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../../schemas/user.schema";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [AuthController],
  providers: [AuthService, LoggerService],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "1h" },
      }),
    }),
  ],
})
export class AuthModule {}
