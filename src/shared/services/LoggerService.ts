import { Injectable } from '@nestjs/common';
import { createLogger, transports, Logger } from 'winston';
import ecsFormat from '@elastic/ecs-winston-format';

@Injectable()
export class LoggerService {
  private readonly logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: 'info',
      format: ecsFormat(),
      transports: [
        new transports.Console(),
        new transports.File({ filename: 'logs/app.log' }),
      ],
    });
  }

  info(message: string, meta?: Record<string, any>) {
    this.logger.info(message, meta);
  }

  debug(message: string, meta?: Record<string, any>) {
    this.logger.debug(message, meta);
  }

  error(message: string, meta?: Record<string, any>) {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: Record<string, any>) {
    this.logger.warn(message, meta);
  }
}
