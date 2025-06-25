import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";
import { LoggerService } from "../../shared/services/LoggerService";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authEnabled =
      this.configService.get<string>("AUTH_ENABLED") === "true";
    const request = context.switchToHttp().getRequest<Request>();

    if (!authEnabled) return true;

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      this.logger.error("No token provided in request");
      throw new UnauthorizedException("No token provided");
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>("JWT_SECRET"),
      });
      
      request['user'] = payload;
      this.logger.info("Token verified and user info added to request", { 
        userId: payload.sub, 
        email: payload.email 
      });
    } catch (error) {
      this.logger.error("Invalid token", { error: error.message });
      throw new UnauthorizedException("Invalid token");
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
