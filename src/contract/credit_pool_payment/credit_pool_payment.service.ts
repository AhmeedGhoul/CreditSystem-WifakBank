import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtUser } from '../../user/strategy/jwt-user.interface';
import { CreateCreditPoolPaymentDto } from './dto/CreditPoolPaymentDto.dto';

@Injectable()
export class CreditpoolpaymentService {
  constructor(private prisma: PrismaService) {}

  async createCreditPoolPayment(dto: CreateCreditPoolPaymentDto, contractId: number, user: JwtUser) {
    const contract = await this.prisma.contracts.findUnique({
      where: { contractId },
    });

    if (!contract) throw new NotFoundException('contract not found');

    if (!user.roles.includes('Admin') && contract.userUserId !== user.userId) {
      throw new ForbiddenException('You cannot add credit pool payments to a contract that is not yours');
    }

    return this.prisma.credit_Pool_Payment.create({
      data: {
        ...dto,
        contractId: contractId,
      },
    });
  }

  async editCreditPoolPayment(dto: CreateCreditPoolPaymentDto, credit_Pool_PaymentId: number, user: JwtUser) {
    const credit_Pool_Payment = await this.prisma.credit_Pool_Payment.findUnique({
      where: { creditPoolPaymentId:credit_Pool_PaymentId },
      include: { contract: true },
    });

    if (!credit_Pool_Payment) throw new NotFoundException('credit pool payment not found');

    if (!user.roles.includes('Admin') && credit_Pool_Payment.contract?.userUserId !== user.userId) {
      throw new ForbiddenException('You can only edit credit pool payments linked to your own contract');
    }

    return this.prisma.credit_Pool_Payment.update({
      where: { creditPoolPaymentId:credit_Pool_PaymentId },
      data: { ...dto },
    });
  }

  async deleteCreditPoolPayment(creditpoolpaymentId: number, user: JwtUser) {
    const credit_Pool_Payment = await this.prisma.credit_Pool_Payment.findUnique({
      where: { creditPoolPaymentId:creditpoolpaymentId },
      include: { contract: true },
    });

    if (!credit_Pool_Payment) throw new NotFoundException('CreditPool Payment not found');

    if (!user.roles.includes('Admin') && credit_Pool_Payment.contract?.userUserId !== user.userId) {
      throw new ForbiddenException('You can only delete credit pool payments linked to your own contract');
    }

    return this.prisma.credit_Pool_Payment.delete({ where: { creditPoolPaymentId:creditpoolpaymentId } });
  }

  async searchCreditPoolPayments(query: {
    contractId: number;
    minAmount?: string;
    maxAmount?: string;
    date?: string;
    sortBy?: string | string[];
    page?: string;
    size?: string;
  }, user: JwtUser) {
    const { contractId, minAmount, maxAmount, date, sortBy, page = '1', size = '10' } = query;
    const contract = await this.prisma.contracts.findUnique({ where: { contractId } });
    if (!contract) throw new NotFoundException('Contract not found');
    if (!user.roles.includes('Admin') && contract.userUserId !== user.userId)
      throw new ForbiddenException('Access denied');

    const filters: any = { contractId };
    if (minAmount || maxAmount) {
      filters.amount = {};
      if (minAmount) filters.amount.gte = minAmount;
      if (maxAmount) filters.amount.lte = maxAmount;
    }
    if (date) filters.date = { contains: date, mode: 'insensitive' };

    const pageNum = parseInt(page, 10);
    const sizeNum = parseInt(size, 10);
    const skip = (pageNum - 1) * sizeNum;

    const orderBy = (typeof sortBy === 'string' ? [sortBy] : sortBy || []).map(f => {
      const [key, dir = 'asc'] = f.split(':');
      return { [key]: dir.toLowerCase() === 'desc' ? 'desc' : 'asc' };
    });

    const [data, total] = await Promise.all([
      this.prisma.credit_Pool_Payment.findMany({ where: filters, skip, take: sizeNum, orderBy }),
      this.prisma.credit_Pool_Payment.count({ where: filters }),
    ]);

    return { data, total, page: pageNum, size: sizeNum, totalPages: Math.ceil(total / sizeNum) };
  }
}
