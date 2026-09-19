import { Transform } from 'class-transformer';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { DECISION_COMMENT_MAX } from '../credit-request.constants';
import { CreditRequestStatus } from '../credit-request-status.enum';

export class UpdateCreditRequestStatusDto {
  @IsIn([CreditRequestStatus.APPROVED, CreditRequestStatus.REJECTED])
  status: CreditRequestStatus.APPROVED | CreditRequestStatus.REJECTED;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(DECISION_COMMENT_MAX)
  comment: string;
}