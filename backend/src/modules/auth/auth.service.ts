import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { Environment } from '../../config/environment.validation';
import { UsersService } from '../users/users.service';
import type { JwtPayload } from './authenticated-user';
import { LoginDto } from './dto/login.dto';

const DUMMY_HASH =
  '$2b$12$C6UzMDM.H6dfI/f/IKcEeOQh6n.Yk8p2q1mG2a0e1u3n5q7s9t1u2';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.users.findByEmail(email);
    const hash = user?.passwordHash ?? DUMMY_HASH;
    const matches = await bcrypt.compare(dto.password, hash);

    if (!user || !matches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const env = this.config.getOrThrow<Environment>('environment');

    return {
      accessToken: await this.jwt.signAsync(payload),
      tokenType: 'Bearer' as const,
      expiresIn: env.JWT_EXPIRES_IN,
      user: { id: user.id, email: user.email },
    };
  }
}