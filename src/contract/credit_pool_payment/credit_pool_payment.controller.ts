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
import { CreditpoolpaymentService } from './credit_pool_payment.service';
import { CreateCreditPoolPaymentDto } from './dto/CreditPoolPaymentDto.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Client', 'Admin')
@Controller('creditpoolpayment')
export class CreditpoolpaymentController {
  constructor(private creditpoolpaymentService: CreditpoolpaymentService) {}

  @Post('add/:contractId')
  @HttpCode(HttpStatus.OK)
  addCreditPoolPayment(
    @Param('contractId', ParseIntPipe) contractId: number,
    @Body() dto: CreateCreditPoolPaymentDto,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.creditpoolpaymentService.createCreditPoolPayment(dto, contractId, user);
  }

  @Get('by-contract/:contractId')
  async getCreditPoolPayments(
    @Param('contractId', ParseIntPipe) contractId: number,
    @Request() req: ExpressRequest,
    @Res() res: Response
  ) {
    const user = req.user as JwtUser;
    const data = await this.creditpoolpaymentService.getCreditPoolPaymentsByContract(contractId, user);
    return res.status(200).json({ status: 'success', data });
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteCreditPoolPayment(
    @Param('id', ParseIntPipe) CreditPoolPaymentId: number,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.creditpoolpaymentService.deleteCreditPoolPayment(CreditPoolPaymentId, user);
  }

  @Patch('modify/:id')
  @HttpCode(HttpStatus.OK)
  modifyCreditPoolPayment(
    @Param('id', ParseIntPipe) CreditPoolPaymentId: number,
    @Body() dto: CreateCreditPoolPaymentDto,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.creditpoolpaymentService.editCreditPoolPayment(dto, CreditPoolPaymentId, user);
  }
}
