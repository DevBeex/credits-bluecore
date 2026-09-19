import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import {
  CREDIT_AMOUNT_MAX,
  CREDIT_AMOUNT_MIN,
  CREDIT_TERM_MAX,
  CREDIT_TERM_MIN,
  LIST_LIMIT_DEFAULT,
  LIST_PAGE_DEFAULT,
} from './credit-request.constants';
import { CreditRequest } from './credit-request.entity';
import { CreditRequestStatus } from './credit-request-status.enum';
import { CreateCreditRequestDto } from './dto/create-credit-request.dto';
import { ListCreditRequestsQueryDto } from './dto/list-credit-requests.query.dto';
import { UpdateCreditRequestStatusDto } from './dto/update-credit-request.status.dto';

@Injectable()
export class CreditRequestsService {
  constructor(
    @InjectRepository(CreditRequest)
    private readonly requests: Repository<CreditRequest>,
  ) {}

  async create(
    dto: CreateCreditRequestDto,
    user: AuthenticatedUser,
  ): Promise<CreditRequest> {
    const applicantDocument = dto.applicantDocument.trim();
    if (!applicantDocument) {
      throw new BadRequestException('La cédula es obligatoria');
    }
    if (dto.amount < CREDIT_AMOUNT_MIN || dto.amount > CREDIT_AMOUNT_MAX) {
      throw new BadRequestException(
        `El monto debe estar entre ${CREDIT_AMOUNT_MIN} y ${CREDIT_AMOUNT_MAX}`,
      );
    }
    if (dto.termMonths < CREDIT_TERM_MIN || dto.termMonths > CREDIT_TERM_MAX) {
      throw new BadRequestException(
        `El plazo debe estar entre ${CREDIT_TERM_MIN} y ${CREDIT_TERM_MAX} meses`,
      );
    }
    const request = this.requests.create({
      applicantDocument,
      amount: String(dto.amount),
      termMonths: dto.termMonths,
      status: CreditRequestStatus.PENDING,
      decisionComment: null,
      createdById: user.id,
      decidedById: null,
      decidedAt: null,
    });
    return this.requests.save(request);
  }

  async list(query: ListCreditRequestsQueryDto) {
    const page = query.page ?? LIST_PAGE_DEFAULT;
    const limit = query.limit ?? LIST_LIMIT_DEFAULT;
    const where = query.status ? { status: query.status } : {};
    const [data, total] = await this.requests.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 0,
      },
    };
  }

  async updateStatus(
    id: string,
    dto: UpdateCreditRequestStatusDto,
    user: AuthenticatedUser,
  ): Promise<CreditRequest> {
    const comment = dto.comment.trim();
    if (!comment) {
      throw new BadRequestException('El comentario es obligatorio');
    }
    if (
      dto.status !== CreditRequestStatus.APPROVED &&
      dto.status !== CreditRequestStatus.REJECTED
    ) {
      throw new BadRequestException('El estado de decisión no es válido');
    }
    const updateResult = await this.requests.update(
      { id, status: CreditRequestStatus.PENDING },
      {
        status: dto.status,
        decisionComment: comment,
        decidedById: user.id,
        decidedAt: new Date(),
      },
    );
    if (updateResult.affected === 1) {
      const updated = await this.requests.findOneByOrFail({ id });
      return updated;
    }
    const existing = await this.requests.findOneBy({ id });
    if (!existing) {
      throw new NotFoundException('La solicitud de crédito no existe');
    }
    throw new ConflictException('La solicitud ya fue decidida');
  }
}