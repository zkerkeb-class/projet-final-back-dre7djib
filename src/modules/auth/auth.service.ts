import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { LoggerService } from "../../shared/services/LoggerService";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../../schemas/user.schema";
import * as bcrypt from "bcrypt";
import { ChangePasswordDto } from "./dto/change-password.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly logger: LoggerService,
    private jwtService: JwtService,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = (await this.userModel
      .findOne({ email })
      .exec()) as User | null;
    if (!user) {
      this.logger.error("User not found:", { email });
      throw new UnauthorizedException("Invalid credentials");
    }

    if (typeof user.password !== "string") {
      this.logger.error("User password is not a string:", { email });
      throw new UnauthorizedException("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      this.logger.error("Invalid password for:", { email });
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = { sub: user._id, email: user.email };
    const access_token = await this.jwtService.signAsync(payload);

    this.logger.info("User logged in successfully:", { email });
    return { access_token };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    this.logger.info("Change password request received", { 
      userId, 
      hasCurrentPassword: !!changePasswordDto.currentPassword,
      newPasswordLength: changePasswordDto.newPassword?.length 
    });

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      this.logger.error("User not found for password change", { userId });
      throw new UnauthorizedException("User not found");
    }

    this.logger.info("User found for password change", { 
      userId, 
      userEmail: user.email 
    });

    if (typeof user.password !== "string") {
      this.logger.error("User password is not a string", { userId });
      throw new UnauthorizedException("Invalid user data");
    }

    this.logger.info("Verifying current password", { userId });
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      this.logger.error("Invalid current password for user", { userId });
      throw new BadRequestException("Current password is incorrect");
    }

    this.logger.info("Current password verified successfully", { userId });

    this.logger.info("Checking if new password is different from current", { userId });
    const isSamePassword = await bcrypt.compare(
      changePasswordDto.newPassword,
      user.password,
    );
    if (isSamePassword) {
      this.logger.error("New password is same as current password", { userId });
      throw new BadRequestException("New password must be different from current password");
    }

    this.logger.info("New password is different from current, proceeding with hash", { userId });
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, saltRounds);

    this.logger.info("Password hashed successfully, updating user in database", { userId });
    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
    });

    this.logger.info("Password changed successfully for user", { 
      userId, 
      userEmail: user.email 
    });
    return { message: "Password changed successfully" };
  }
}
