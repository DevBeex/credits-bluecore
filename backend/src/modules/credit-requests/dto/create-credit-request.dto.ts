import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  APPLICANT_DOCUMENT_MAX,
  CREDIT_AMOUNT_MAX,
  CREDIT_AMOUNT_MIN,
  CREDIT_TERM_MAX,
  CREDIT_TERM_MIN,
} from '../credit-request.constants';

export class CreateCreditRequestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(APPLICANT_DOCUMENT_MAX)
  applicantDocument: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(CREDIT_AMOUNT_MIN)
  @Max(CREDIT_AMOUNT_MAX)
  amount: number;

  @Type(() => Number)
  @IsInt()
  @Min(CREDIT_TERM_MIN)
  @Max(CREDIT_TERM_MAX)
  termMonths: number;
}