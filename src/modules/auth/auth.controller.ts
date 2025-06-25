import { Controller, Post, Body, UseGuards, Request, UnauthorizedException, Logger } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginAuthDto } from "./dto/login-auth.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { AuthGuard } from "../../common/guards/AuthGuard";
import { LoggerService } from "src/shared/services/LoggerService";

@Controller("auth")
export class AuthController {
  
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {}

  @Post("login")
  async login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto.email, loginAuthDto.password);
  }

  @Post("change-password")
  @UseGuards(AuthGuard)
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    this.logger.info("Change password endpoint called");
    this.logger.info("Request headers:", req.headers);
    this.logger.info("Request body:", { 
      hasCurrentPassword: !!changePasswordDto.currentPassword,
      newPasswordLength: changePasswordDto.newPassword?.length 
    });
    this.logger.info("User from request:", req.user);
    
    const userId = req.user?.sub;
    if (!userId) {
      this.logger.error("No user ID found in request", { user: req.user });
      throw new UnauthorizedException("User not authenticated");
    }
    
    this.logger.info("User ID extracted:", userId);
    return this.authService.changePassword(userId, changePasswordDto);
  }
}
