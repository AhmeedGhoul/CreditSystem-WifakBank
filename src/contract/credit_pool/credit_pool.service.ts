import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtUser } from '../../user/strategy/jwt-user.interface';
import { CreateCreditPoolDto } from './dto/CreditPool.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreditPoolService {
  constructor(private prisma: PrismaService) {}

  async createCreditPool(dto: CreateCreditPoolDto) {
    const { Period, Frequency, ...rest } = dto;
    const computedMaxPeople = Math.round(Period / Frequency);

    return this.prisma.credit_Pool.create({
      data: {
        ...rest,
        Period,
        Frequency,
        maxPeople: computedMaxPeople,
        isFull: false,
      },
    });
  }

  async assignContractToCreditPool(
    contractId: number,
    creditPoolId: number,
    user: JwtUser,
  ) {
    const contract = await this.prisma.contracts.findUnique({ where: { contractId } });
    const pool = await this.prisma.credit_Pool.findUnique({
      where: { creditPoolId },
      include: { contracts: true },
    });

    if (!contract || !pool) throw new NotFoundException('Contract or Credit Pool not found');
    if (!user.roles.includes('Admin')) {
      throw new ForbiddenException('Only admins can assign contracts to credit pools');
    }

    await this.prisma.contracts.update({
      where: { contractId },
      data: { creditPoolId },
    });
    
  }

  async triggerPaymentsWhenFull(creditPoolId: number) {
    const pool = await this.prisma.credit_Pool.findUnique({
      where: { creditPoolId },
      include: {
        contracts: true,
      },
    });

    if (!pool || pool.contracts.length < pool.maxPeople) return;

    const startDate = new Date();
    const cycleMonths = pool.Frequency;
    const totalCycles = pool.Period / cycleMonths;

    for (let i = 0; i < totalCycles; i++) {
      const cyclePaymentDate = new Date(startDate);
      cyclePaymentDate.setMonth(cyclePaymentDate.getMonth() + i * cycleMonths);

      const maxDate = new Date(cyclePaymentDate);
      maxDate.setDate(maxDate.getDate() + 7);

      for (const contract of pool.contracts) {
        const individualAmountPerStep = contract.amount / contract.frequency;

        await this.prisma.credit_Pool_Payment.create({
          data: {
            PaymentDate: cyclePaymentDate,
            MaximumDate: maxDate,
            amount: individualAmountPerStep,
            isPayed: false,
            contractId: contract.contractId,
          },
        });
      }
    }
  }


  async isFullCreditPool(creditPoolId: number): Promise<void> {
    const pool = await this.prisma.credit_Pool.findUnique({
      where: { creditPoolId },
      include: { contracts: true },
    });

    if (!pool) throw new NotFoundException("Credit Pool not found");

    const isFull = pool.contracts.length >= pool.maxPeople;

    await this.prisma.credit_Pool.update({
      where: { creditPoolId },
      data: { isFull },
    });
  }

  async getCreditPoolsByUser(userId: number) {
    return this.prisma.credit_Pool.findMany({
      where: {
        contracts: {
          some: {
            userUserId: userId,
          },
        },
      },
      include: { contracts: true },
    });
  }

  async editCreditPool(dto: CreateCreditPoolDto, creditPoolId: number, user: JwtUser) {
    const creditPool = await this.prisma.credit_Pool.findUnique({ where: { creditPoolId } });
    if (!creditPool) throw new NotFoundException('Credit pool not found');

    if (!user.roles.includes('Admin')) {
      throw new ForbiddenException('Only admin can edit credit pools');
    }

    return this.prisma.credit_Pool.update({
      where: { creditPoolId },
      data: { ...dto },
    });
  }

  async deleteCreditPool(creditPoolId: number, user: JwtUser) {
    if (!user.roles.includes('Admin')) {
      throw new ForbiddenException('Only admin can delete credit pools');
    }

    return this.prisma.credit_Pool.delete({ where: { creditPoolId } });
  }

  async removeContractFromCreditPool(contractId: number, user: JwtUser) {
    const contract = await this.prisma.contracts.findUnique({ where: { contractId } });

    if (!contract) throw new NotFoundException('Contract not found');

    if (!user.roles.includes('Admin')) {
      throw new ForbiddenException('Only admins can remove contracts from credit pools');
    }

    return this.prisma.contracts.update({
      where: { contractId },
      data: { creditPoolId: null },
    });
  }

  async searchCreditPools(query: {
    minValue?: number;
    maxValue?: number;
    isFull?: boolean;
    sortBy?: string | string[];
    page?: string;
    size?: string;
  }) {
    const { minValue, maxValue, isFull, sortBy, page = '1', size = '10' } = query;
    const pageNum = parseInt(page, 10);
    const sizeNum = parseInt(size, 10);
    const skip = (pageNum - 1) * sizeNum;

    const filters: any = {};
    if (isFull !== undefined) filters.isFull = isFull;
    if (minValue !== undefined || maxValue !== undefined) {
      filters.minValue = {};
      if (minValue !== undefined) filters.minValue.gte = minValue;
      if (maxValue !== undefined) filters.minValue.lte = maxValue;
    }

    const orderBy = (typeof sortBy === 'string' ? [sortBy] : sortBy || []).map(f => {
      const [key, dir = 'asc'] = f.split(':');
      return { [key]: dir.toLowerCase() === 'desc' ? 'desc' : 'asc' };
    });

    const [data, total] = await Promise.all([
      this.prisma.credit_Pool.findMany({
        where: filters,
        skip,
        take: sizeNum,
        orderBy,
        include: {
          contracts: {
            select: { userUserId: true },
          },
        },
      }),
      this.prisma.credit_Pool.count({ where: filters }),
    ]);

    return { data, total, page: pageNum, size: sizeNum, totalPages: Math.ceil(total / sizeNum) };
  }
  async leaveCreditPool(creditPoolId: number, user: JwtUser) {
    const contract = await this.prisma.contracts.findFirst({
      where: {
        creditPoolId,
        userUserId: user.userId,
      },
    });

    if (!contract) {
      throw new NotFoundException("You are not a participant in this credit pool");
    }

    const pool = await this.prisma.credit_Pool.findUnique({
      where: { creditPoolId },
    });

    if (!pool) throw new NotFoundException('Credit pool not found');
    if (pool.isFull) {
      throw new ForbiddenException("You can't leave a full/started credit pool");
    }

    await this.prisma.contracts.delete({
      where: { contractId: contract.contractId },
    });

    return { message: 'Successfully left the credit pool' };
  }

}
