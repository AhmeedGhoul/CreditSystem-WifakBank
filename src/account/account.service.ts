import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtUser } from '../user/strategy/jwt-user.interface';
import { CreateAccountDto } from './dto/AccountDto.dto';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  async createAccount(dto: CreateAccountDto, userId: number) {
    return this.prisma.account.create({
      data: {
        ...dto,
        linkedUserId: userId,
      },
    });
  }
  async editAccount(dto: CreateAccountDto, accountId: number, user: JwtUser) {
    const account = await this.prisma.account.findUnique({ where: { accountId:accountId } });

    if (!account) {
      throw new NotFoundException('account not found');
    }

    if (!user.roles.includes('Admin') && account.linkedUserId !== user.userId) {
      throw new ForbiddenException('You can only edit your own accounts');
    }

    return this.prisma.account.update({
      where: { accountId:accountId },
      data: { ...dto },
    });
  }

  async deleteAccount(accountId: number, user: JwtUser) {
    const account = await this.prisma.account.findUnique({ where: { accountId } });

    if (!account) {
      throw new NotFoundException('account not found');
    }

    if (!user.roles.includes('Admin') && account.linkedUserId !== user.userId) {
      throw new ForbiddenException('You can only delete your own accounts');
    }

    return this.prisma.account.delete({ where: { accountId } });
  }

  async searchAccounts(query: {
    minAmount?: number;
    maxAmount?: number;
    trackingNumber?: number;
    startDate?: string;
    endDate?: string;
    sortBy?: string | string[];
    page?: string;
    size?: string;
  }, user: JwtUser) {
    const { minAmount, maxAmount, trackingNumber, startDate, endDate, sortBy, page = '1', size = '10' } = query;

    const pageNum = parseInt(page, 10);
    const sizeNum = parseInt(size, 10);
    const skip = (pageNum - 1) * sizeNum;

    const filters: any = {};
    if (!user.roles.includes('Admin')) filters.linkedUserId = user.userId;
    if (trackingNumber) filters.trackingNumber = trackingNumber;
    if (minAmount !== undefined || maxAmount !== undefined) {
      filters.amount = {};
      if (minAmount !== undefined) filters.amount.gte = Number(minAmount);
      if (maxAmount !== undefined) filters.amount.lte = Number(maxAmount);
    }
    if (startDate || endDate) {
      filters.openDate = {};
      if (startDate) filters.openDate.gte = new Date(startDate);
      if (endDate) filters.openDate.lte = new Date(endDate);
    }

    const orderBy = (typeof sortBy === 'string' ? [sortBy] : sortBy || []).map(s => {
      const [key, dir = 'asc'] = s.split(':');
      return { [key]: dir.toLowerCase() === 'desc' ? 'desc' : 'asc' };
    });

    const [data, total] = await Promise.all([
      this.prisma.account.findMany({ where: filters, skip, take: sizeNum, orderBy }),
      this.prisma.account.count({ where: filters }),
    ]);

    return { data, total, page: pageNum, size: sizeNum, totalPages: Math.ceil(total / sizeNum) };
  }
  async findAccountByUserId(userId: number) {
    return this.prisma.account.findFirst({
      where: { linkedUserId: userId },
    });
  }
  async incrementBalance(userId: number, amount: number) {
    const acc = await this.prisma.account.findFirst({ where: { linkedUserId: userId } });
    if (!acc) throw new NotFoundException('Account missing');
    return this.prisma.account.update({
      where: { accountId: acc.accountId },
      data: { balance: acc.balance + amount },
    });
  }


}
