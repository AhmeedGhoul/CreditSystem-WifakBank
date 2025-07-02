import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAccountPaymentDto } from './dto/AccountPaymentDto.dto';
import { JwtUser } from '../../user/strategy/jwt-user.interface';

@Injectable()
export class AccountpaymentService {
  constructor(private prisma: PrismaService) {}

  async createAccountPayment(dto: CreateAccountPaymentDto, accountId: number, user: JwtUser) {
    const account = await this.prisma.account.findUnique({
      where: { accountId },
    });

    if (!account) throw new NotFoundException('Account not found');

    if (!user.roles.includes('Admin') && account.linkedUserId !== user.userId) {
      throw new ForbiddenException('You cannot add Payments to a account that is not yours');
    }

    return this.prisma.account_Payment.create({
      data: {
        ...dto,
        accountId: accountId,
      },
    });
  }

  async editAccountPayment(dto: CreateAccountPaymentDto, paymentId: number, user: JwtUser) {
    const accountPayment = await this.prisma.account_Payment.findUnique({
      where: { paymentId },
      include: { account: true },
    });

    if (!accountPayment) throw new NotFoundException('AccountPayment not found');

    if (!user.roles.includes('Admin') && accountPayment.account?.linkedUserId !== user.userId) {
      throw new ForbiddenException('You can only edit accountPayment linked to your own account');
    }

    return this.prisma.account_Payment.update({
      where: { paymentId },
      data: { ...dto },
    });
  }

  async deleteAccountPayment(paymentId: number, user: JwtUser) {
    const payment = await this.prisma.account_Payment.findUnique({
      where: { paymentId },
      include: { account: true },
    });

    if (!payment) throw new NotFoundException('payment not found');

    if (!user.roles.includes('Admin') && payment.account?.linkedUserId !== user.userId) {
      throw new ForbiddenException('You can only delete payments linked to your own account');
    }

    return this.prisma.account_Payment.delete({ where: { paymentId } });
  }

  async getAccountPaymentsByAccount(accountId: number, user: JwtUser) {
    const account = await this.prisma.account.findUnique({
      where: { accountId },
    });

    if (!account) throw new NotFoundException('account not found');

    if (!user.roles.includes('Admin') && account.linkedUserId !== user.userId) {
      throw new ForbiddenException('You can only view payments linked to your own account');
    }

    return this.prisma.account_Payment.findMany({
      where: { accountId },
    });
  }
}
