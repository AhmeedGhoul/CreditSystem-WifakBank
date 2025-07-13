
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post, Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request as ExpressRequest } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { AccountpaymentService } from './account_payment.service';
import { RolesGuard } from '../../../user/Roles.guard';
import { Roles } from '../../../decorator/roles.decorator';
import { CreateAccountPaymentDto } from '../dto/AccountPaymentDto.dto';
import { JwtUser } from '../../../user/strategy/jwt-user.interface';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Client', 'Admin')
@Controller('accountpayment')
export class AccountpaymentController {
  constructor(private accountpaymentService: AccountpaymentService) {}

  @Post('add/:accountId')
  @HttpCode(HttpStatus.OK)
  addAccountpayment(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() dto: CreateAccountPaymentDto,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.accountpaymentService.createAccountPayment(dto, accountId, user);
  }

  @Get('search')
  getPayments(@Query() query: any, @Request() req: ExpressRequest) {
    const user = req.user as JwtUser;
    return this.accountpaymentService.searchAccountPayments(query, user);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteAccountpayment(
    @Param('id', ParseIntPipe) accountpaymentId: number,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.accountpaymentService.deleteAccountPayment(accountpaymentId, user);
  }

  @Patch('modify/:id')
  @HttpCode(HttpStatus.OK)
  modifyAccountpayment(
    @Param('id', ParseIntPipe) accountpaymentId: number,
    @Body() dto: CreateAccountPaymentDto,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.accountpaymentService.editAccountPayment(dto, accountpaymentId, user);
  }
}

