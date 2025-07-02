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
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request as ExpressRequest } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../user/Roles.guard';
import { Roles } from '../../decorator/roles.decorator';
import { JwtUser } from '../../user/strategy/jwt-user.interface';
import { AccountpaymentService } from './account_payment.service';
import { CreateAccountPaymentDto } from './dto/AccountPaymentDto.dto';

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

  @Get('by-account/:accountId')
  async getAccountpayments(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Request() req: ExpressRequest,
    @Res() res: Response
  ) {
    const user = req.user as JwtUser;
    const data = await this.accountpaymentService.getAccountPaymentsByAccount(accountId, user);
    return res.status(200).json({ status: 'success', data });
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
