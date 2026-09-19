import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  LIST_LIMIT_DEFAULT,
  LIST_LIMIT_MAX,
  LIST_PAGE_DEFAULT,
} from '../credit-request.constants';
import { CreditRequestStatus } from '../credit-request-status.enum';

export class ListCreditRequestsQueryDto {
  @IsOptional()
  @IsEnum(CreditRequestStatus)
  status?: CreditRequestStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = LIST_PAGE_DEFAULT;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(LIST_LIMIT_MAX)
  limit: number = LIST_LIMIT_DEFAULT;
}