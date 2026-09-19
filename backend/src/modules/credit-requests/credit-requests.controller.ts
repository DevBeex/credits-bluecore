import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { CreditRequestsService } from './credit-requests.service';
import { CreateCreditRequestDto } from './dto/create-credit-request.dto';

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
}