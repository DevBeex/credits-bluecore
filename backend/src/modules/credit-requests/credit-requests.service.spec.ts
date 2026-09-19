import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreditRequest } from './credit-request.entity';
import { CreditRequestStatus } from './credit-request-status.enum';
import { CreditRequestsService } from './credit-requests.service';

describe('CreditRequestsService', () => {
  let service: CreditRequestsService;
  const save = jest.fn();
  const create = jest.fn((value) => value);
  const user = { id: 'user-1', email: 'operator@bluecore.local' };

  beforeEach(async () => {
    save.mockReset();
    create.mockClear();
    save.mockImplementation((value) => Promise.resolve({ id: 'req-1', ...value }));

    const module = await Test.createTestingModule({
      providers: [
        CreditRequestsService,
        {
          provide: getRepositoryToken(CreditRequest),
          useValue: { create, save },
        },
      ],
    }).compile();

    service = module.get(CreditRequestsService);
  });

  const valid = {
    applicantDocument: '  8-123-456  ',
    amount: 1500,
    termMonths: 12,
  };

  it('rejects an amount below 500', async () => {
    await expect(
      service.create({ ...valid, amount: 499.99 }, user),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an amount above 50000', async () => {
    await expect(
      service.create({ ...valid, amount: 50000.01 }, user),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a term outside 6–60 months', async () => {
    await expect(
      service.create({ ...valid, termMonths: 5 }, user),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.create({ ...valid, termMonths: 61 }, user),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a pending request owned by the authenticated user', async () => {
    const result = await service.create(valid, user);

    expect(result.status).toBe(CreditRequestStatus.PENDING);
    expect(result.createdById).toBe(user.id);
    expect(result.applicantDocument).toBe('8-123-456');
    expect(result.decidedById).toBeNull();
    expect(save).toHaveBeenCalled();
  });
});