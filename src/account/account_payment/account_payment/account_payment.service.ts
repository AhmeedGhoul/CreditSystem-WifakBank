
import {
  ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAccountPaymentDto } from '../dto/AccountPaymentDto.dto';
import { JwtUser } from 'src/user/strategy/jwt-user.interface';


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

  async searchAccountPayments(query: {
    accountId: number;
    method?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    sortBy?: string | string[];
    page?: string;
    size?: string;
  }, user: JwtUser) {
    const { accountId, method, startDate, endDate, minAmount, maxAmount, sortBy, page = '1', size = '10' } = query;

    const account = await this.prisma.account.findUnique({ where: { accountId } });
    if (!account) throw new NotFoundException('account not found');
    if (!user.roles.includes('Admin') && account.linkedUserId !== user.userId)
      throw new ForbiddenException('Not allowed to access this account payments');

    const filters: any = { accountId };
    if (method) filters.method = { contains: method, mode: 'insensitive' };
    if (minAmount !== undefined || maxAmount !== undefined) {
      filters.amount = {};
      if (minAmount !== undefined) filters.amount.gte = Number(minAmount);
      if (maxAmount !== undefined) filters.amount.lte = Number(maxAmount);
    }
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.gte = new Date(startDate);
      if (endDate) filters.date.lte = new Date(endDate);
    }

    const orderBy = (typeof sortBy === 'string' ? [sortBy] : sortBy || []).map(s => {
      const [key, dir = 'asc'] = s.split(':');
      return { [key]: dir.toLowerCase() === 'desc' ? 'desc' : 'asc' };
    });

    const [data, total] = await Promise.all([
      this.prisma.account_Payment.findMany({ where: filters, skip: (parseInt(page) - 1) * parseInt(size), take: parseInt(size), orderBy }),
      this.prisma.account_Payment.count({ where: filters }),
    ]);

    return { data, total, page: parseInt(page), size: parseInt(size), totalPages: Math.ceil(total / parseInt(size)) };
  }

}

