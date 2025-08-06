import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtUser } from '../user/strategy/jwt-user.interface';
import { CreateContractDto } from './dto/ContractDto.dto';
import { CreditPoolService } from './credit_pool/credit_pool.service';

@Injectable()
export class ContractService {
  constructor(private prisma: PrismaService,private creditPool:CreditPoolService) {}
  async createContract(dto: CreateContractDto, userId: number, pdfUrl: string) {
    const existing = await this.prisma.contracts.findFirst({
      where: {
        userUserId: userId,
        creditPoolId: dto.creditPoolId,
      },
    });

    if (existing) {
      throw new BadRequestException("You have already joined this credit pool.");
    }

    const contract = await this.prisma.contracts.create({
      data: {
        contractDate: dto.contractDate,
        amount: dto.amount,
        period: dto.period,
        pdfUrl,
        userUserId: userId,
        creditPoolId: dto.creditPoolId,
        rank:dto.rank
      },
    });
   await this.creditPool.triggerPaymentsWhenFull(dto.creditPoolId);
    return contract;

  }


  async editContract(dto: CreateContractDto, contractId: number, user: JwtUser) {
    const contracts = await this.prisma.contracts.findUnique({ where: { contractId } });

    if (!contracts) {
      throw new NotFoundException('Contract not found');
    }

    if (!user.roles.includes('Admin') && contracts.userUserId !== user.userId) {
      throw new ForbiddenException('You can only edit your own contracts');
    }

    return this.prisma.contracts.update({
      where: { contractId },
      data: { ...dto },
    });
  }

  async deleteContract(contractId: number, user: JwtUser) {
    const contracts = await this.prisma.contracts.findUnique({ where: { contractId } });

    if (!contracts) {
      throw new NotFoundException('Contract not found');
    }

    if (!user.roles.includes('Admin') && contracts.userUserId !== user.userId) {
      throw new ForbiddenException('You can only delete your own contracts');
    }

    return this.prisma.contracts.delete({ where: { contractId } });
  }

  async searchContracts(query: {
    minAmount?: number;
    maxAmount?: number;
    minDeposit?: number;
    maxDeposit?: number;
    startDate?: string;
    endDate?: string;
    sortBy?: string | string[];
    page?: string;
    size?: string;
  }, user: JwtUser) {
    const { minAmount, maxAmount, minDeposit, maxDeposit, startDate, endDate, sortBy, page = '1', size = '10' } = query;
    const pageNum = parseInt(page, 10);
    const sizeNum = parseInt(size, 10);
    const skip = (pageNum - 1) * sizeNum;

    const filters: any = {};
    if (!user.roles.includes('Admin')) filters.userUserId = user.userId;
    if (minAmount !== undefined || maxAmount !== undefined) {
      filters.amount = {};
      if (minAmount !== undefined) filters.amount.gte = minAmount;
      if (maxAmount !== undefined) filters.amount.lte = maxAmount;
    }
    if (minDeposit !== undefined || maxDeposit !== undefined) {
      filters.deposit = {};
      if (minDeposit !== undefined) filters.deposit.gte = minDeposit;
      if (maxDeposit !== undefined) filters.deposit.lte = maxDeposit;
    }
    if (startDate || endDate) {
      filters.contractDate = {};
      if (startDate) filters.contractDate.gte = new Date(startDate);
      if (endDate) filters.contractDate.lte = new Date(endDate);
    }

    const orderBy = (typeof sortBy === 'string' ? [sortBy] : sortBy || []).map(f => {
      const [key, dir = 'asc'] = f.split(':');
      return { [key]: dir.toLowerCase() === 'desc' ? 'desc' : 'asc' };
    });

    const [data, total] = await Promise.all([
      this.prisma.contracts.findMany({ where: filters, skip, take: sizeNum, orderBy }),
      this.prisma.contracts.count({ where: filters }),
    ]);

    return { data, total, page: pageNum, size: sizeNum, totalPages: Math.ceil(total / sizeNum) };
  }

  async findByUserId(userId: number) {
    return this.prisma.contracts.findMany({
      where: {
        userUserId: userId,
      },
      select: {
        contractId: true,
        userUserId: true,
        creditPoolId: true,
      },
    });
  }
  async getTakenRanks(creditPoolId: number): Promise<number[]> {
    const contracts = await this.prisma.contracts.findMany({
      where: { creditPoolId },
      select: { rank: true },
    });
    return contracts.map(c => c.rank).filter(rank => rank !== 0);
  }

}
