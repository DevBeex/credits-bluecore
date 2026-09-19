import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { CreditRequestsService } from './credit-requests.service';
import { CreateCreditRequestDto } from './dto/create-credit-request.dto';
import { ListCreditRequestsQueryDto } from './dto/list-credit-requests.query.dto';

@Controller({ path: 'credit-requests', version: '1' })
export class CreditRequestsController {
  constructor(private readonly creditRequests: CreditRequestsService) {}

  @Post()
  create(
    @Body() dto: CreateCreditRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.creditRequests.create(dto, user);
  }

  @Get()
  list(@Query() query: ListCreditRequestsQueryDto) {
    return this.creditRequests.list(query);
  }
}