import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { QueryFailedError } from 'typeorm';
import type { Environment } from '../../config/environment.validation';
import { UsersService } from './users.service';

@Injectable()
export class DemoUserSeed implements OnModuleInit {
  private readonly logger = new Logger(DemoUserSeed.name);

  constructor(
    private readonly users: UsersService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const env = this.config.getOrThrow<Environment>('environment');
    const email = env.DEMO_USER_EMAIL.toLowerCase();
    const existing = await this.users.findByEmail(email);

    if (existing) {
      this.logger.log(`Demo user already present: ${email}`);
      return;
    }

    const passwordHash = await bcrypt.hash(env.DEMO_USER_PASSWORD, 12);

    try {
      await this.users.create(email, passwordHash);
      this.logger.log(`Demo user created: ${email}`);
    } catch (error) {
      if (!(error instanceof QueryFailedError)) {
        throw error;
      }
      const code = (error.driverError as { code?: string } | undefined)?.code;
      if (code === '23505') {
        this.logger.log(`Demo user already present: ${email}`);
        return;
      }
      throw error;
    }
  }
}