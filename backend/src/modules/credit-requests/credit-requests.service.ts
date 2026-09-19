import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import {
  CREDIT_AMOUNT_MAX,
  CREDIT_AMOUNT_MIN,
  CREDIT_TERM_MAX,
  CREDIT_TERM_MIN,
} from './credit-request.constants';
import { CreditRequest } from './credit-request.entity';
import { CreditRequestStatus } from './credit-request-status.enum';
import { CreateCreditRequestDto } from './dto/create-credit-request.dto';

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
}