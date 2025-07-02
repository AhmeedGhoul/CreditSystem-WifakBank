import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtUser } from '../user/strategy/jwt-user.interface';
import { CreateContractDto } from './dto/ContractDto.dto';

@Injectable()
export class ContractService {
  constructor(private prisma: PrismaService) {}

  async createContract(dto: CreateContractDto, userId: number) {
    return this.prisma.contracts.create({
      data: {
        userUserId: userId,
        ...dto,
      },
    });
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

  async getContracts(user: JwtUser) {
    if (user.roles.includes('Admin')) {
      return this.prisma.contracts.findMany();
    }

    return this.prisma.contracts.findMany({
      where: { userUserId: user.userId },
    });
  }
}
