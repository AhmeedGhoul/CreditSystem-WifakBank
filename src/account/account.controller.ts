import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus, NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post, Put, Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request as ExpressRequest } from 'express';
import { Roles } from '../decorator/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../user/Roles.guard';
import { JwtUser } from '../user/strategy/jwt-user.interface';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/AccountDto.dto';
import { StripeService } from '../stripe/stripe.service';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Client', 'Admin')
@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService,private stripeService:StripeService) {}

  @Post('add')
  @HttpCode(HttpStatus.OK)
  addAccount(
    @Request() req: ExpressRequest,
    @Body() body: { stripePaymentIntentId: string }
  ) {
    const user = req.user as JwtUser;
    const trackingNumber = Math.floor(Math.random() * 1_000_000);

    return this.accountService.createAccount({
      openDate: new Date(),
      trackingNumber,
      stripePaymentIntentId: body.stripePaymentIntentId,
    }, user.userId);
  }

  @Get('search')
  getAccounts(@Query() query: any, @Request() req: ExpressRequest) {
    const user = req.user as JwtUser;
    return this.accountService.searchAccounts(query, user);
  }
  @Get('find/:id')
  async findAccountByUserId(@Param('id', ParseIntPipe) userId: number) {
    const account = await this.accountService.findAccountByUserId(userId);
    return { exists: !!account };
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteAccount(
    @Param('id', ParseIntPipe) accountId: number,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.accountService.deleteAccount(accountId, user);
  }

  @Put('modify/:id')
  @HttpCode(HttpStatus.OK)
  modifyAccount(
    @Param('id', ParseIntPipe) accountId: number,
    @Body() dto: CreateAccountDto,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.accountService.editAccount(dto, accountId, user);
  }
  @Get('dashboard-data')
  async getDashboardData(@Request() req: ExpressRequest) {
    const user = req.user as JwtUser;

    const account = await this.accountService.findAccountByUserId(user.userId);
    if (!account) throw new NotFoundException('Account not found');

    const customer = await this.stripeService.findOrCreateCustomer(user.userId, user.email);
    const methods = await this.stripeService.getCustomerCards(customer.id);

    const payments = await this.stripeService.getCustomerPayments(customer.id);

    return {
      balance: account.balance,
      cards: methods,
      logs: payments
    };
  }
  @Post('add-money')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async addMoney(@Request() req: ExpressRequest, @Body('amount') amount: number) {
    const user = req.user as JwtUser;
    const account = await this.accountService.incrementBalance(user.userId, amount);
    return account;
  }
  @Get('payment-methods')
  @UseGuards(AuthGuard('jwt'))
  async getPaymentMethods(@Request() req: ExpressRequest) {
    const user = req.user as JwtUser;
    const customer = await this.stripeService.findOrCreateCustomer(user.userId, user.email);
    return { data: await this.stripeService.listPaymentMethods(customer.id) };
  }
  @Get('balance')
  getBalance(@Request() req: ExpressRequest) {
    const user = req.user as JwtUser;
    return this.accountService.findAccountByUserId(user.userId);
  }
}
