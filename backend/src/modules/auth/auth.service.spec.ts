import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let users: { findByEmail: jest.Mock };

  const password = 'Password123';
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash(password, 4);
  });

  beforeEach(async () => {
    users = { findByEmail: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('token') },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: () => ({ JWT_EXPIRES_IN: '8h' }),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('rejects unknown email with the same message', async () => {
    users.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'nobody@test.com', password }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a wrong password', async () => {
    users.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'operator@bluecore.local',
      passwordHash,
    });

    await expect(
      service.login({ email: 'operator@bluecore.local', password: 'wrongpass' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns a token for valid credentials', async () => {
    users.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'operator@bluecore.local',
      passwordHash,
    });

    const result = await service.login({
      email: 'operator@bluecore.local',
      password,
    });

    expect(result.accessToken).toBe('token');
    expect(result.user).toEqual({
      id: 'user-1',
      email: 'operator@bluecore.local',
    });
  });
});