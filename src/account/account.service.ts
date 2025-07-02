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
        linkedUserId: userId,
        ...dto,
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

  async getAccounts(user: JwtUser) {
    if (user.roles.includes('Admin')) {
      return this.prisma.account.findMany();
    }

    return this.prisma.account.findMany({
      where: { linkedUserId: user.userId },
    });
  }
}
