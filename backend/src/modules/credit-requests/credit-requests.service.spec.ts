import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
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
  const findAndCount = jest.fn();
  const update = jest.fn();
  const findOneBy = jest.fn();
  const findOneByOrFail = jest.fn();

  beforeEach(async () => {
    save.mockReset();
    create.mockClear();
    findAndCount.mockReset();
    update.mockReset();
    findOneBy.mockReset();
    findOneByOrFail.mockReset();
    
    save.mockImplementation((value) => Promise.resolve({ id: 'req-1', ...value }));

    const module = await Test.createTestingModule({
      providers: [
        CreditRequestsService,
        {
          provide: getRepositoryToken(CreditRequest),
          useValue: { create, save, findAndCount, update, findOneBy, findOneByOrFail },
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
  it('lists without a status filter when status is omitted', async () => {
    findAndCount.mockResolvedValue([[], 0]);
    await service.list({ page: 1, limit: 20 });
    expect(findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        skip: 0,
        take: 20,
        order: { createdAt: 'DESC' },
      }),
    );
  });
  it('filters by status and paginates', async () => {
    findAndCount.mockResolvedValue([[{ id: 'req-1' }], 21]);
    const result = await service.list({
      status: CreditRequestStatus.PENDING,
      page: 2,
      limit: 10,
    });
    expect(findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: CreditRequestStatus.PENDING },
        skip: 10,
        take: 10,
      }),
    );
    expect(result.meta).toEqual({
      page: 2,
      limit: 10,
      total: 21,
      totalPages: 3,
    });
  });

  const decision = {
    status: CreditRequestStatus.APPROVED as const,
    comment: '  Cumple política  ',
  };
  it('rejects an empty decision comment', async () => {
    await expect(
      service.updateStatus('req-1', { ...decision, comment: '   ' }, user),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(update).not.toHaveBeenCalled();
  });
  it('updates only while the request is pending', async () => {
    update.mockResolvedValue({ affected: 1 });
    findOneByOrFail.mockResolvedValue({
      id: 'req-1',
      status: CreditRequestStatus.APPROVED,
    });
    await service.updateStatus('req-1', decision, user);
    expect(update).toHaveBeenCalledWith(
      { id: 'req-1', status: CreditRequestStatus.PENDING },
      expect.objectContaining({
        status: CreditRequestStatus.APPROVED,
        decisionComment: 'Cumple política',
        decidedById: user.id,
      }),
    );
  });
  it('returns 404 when the request does not exist', async () => {
    update.mockResolvedValue({ affected: 0 });
    findOneBy.mockResolvedValue(null);
    await expect(
      service.updateStatus('req-1', decision, user),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
  it('returns 409 when the request was already decided', async () => {
    update.mockResolvedValue({ affected: 0 });
    findOneBy.mockResolvedValue({
      id: 'req-1',
      status: CreditRequestStatus.REJECTED,
    });
    await expect(
      service.updateStatus('req-1', decision, user),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});