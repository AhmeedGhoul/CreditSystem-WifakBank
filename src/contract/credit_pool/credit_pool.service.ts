import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtUser } from '../../user/strategy/jwt-user.interface';
import { CreateCreditPoolDto } from './dto/CreditPool.dto';

@Injectable()
export class CreditPoolService {
  constructor(private prisma: PrismaService) {}

  async createCreditPool(dto: CreateCreditPoolDto) {
    return this.prisma.credit_Pool.create({
      data: { ...dto },
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

  async getCreditPools() {
    return this.prisma.credit_Pool.findMany();
  }

  async getContractsByCreditPool(creditPoolId: number, user: JwtUser) {
    if (!user.roles.includes('Admin')) {
      throw new ForbiddenException('Only admin can view contracts by credit pool');
    }

    return this.prisma.contracts.findMany({
      where: { creditPoolId },
    });
  }
  async assignContractToCreditPool(
    contractId: number,
    creditPoolId: number,
    user: JwtUser,
  ) {
    const contract = await this.prisma.contracts.findUnique({ where: { contractId } });
    const pool = await this.prisma.credit_Pool.findUnique({ where: { creditPoolId } });

    if (!contract || !pool) throw new NotFoundException('Contract or Credit Pool not found');

    if (!user.roles.includes('Admin')) {
      throw new ForbiddenException('Only admins can assign contracts to credit pools');
    }

    return this.prisma.contracts.update({
      where: { contractId },
      data: { creditPoolId },
    });
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
}
