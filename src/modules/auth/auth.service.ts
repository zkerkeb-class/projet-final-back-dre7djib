import { Injectable, UnauthorizedException } from "@nestjs/common";
import { LoggerService } from "../../shared/services/LoggerService";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../../schemas/user.schema";
import * as bcrypt from "bcrypt";

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
}
