import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGarentDto } from './dto/GarentDto.dto';
import { JwtUser } from '../user/strategy/jwt-user.interface';

@Injectable()
export class GarentService {
  constructor(private prisma: PrismaService) {}

  async createGarent(dto: CreateGarentDto, userId: number) {
    return this.prisma.garent.create({
      data: {
        userUserId: userId,
        ...dto,
      },
    });
  }

  async editGarent(dto: CreateGarentDto, GarentId: number, user: JwtUser) {
    const garent = await this.prisma.garent.findUnique({ where: { garentId:GarentId } });

    if (!garent) {
      throw new NotFoundException('garent not found');
    }

    if (!user.roles.includes('Admin') && garent.userUserId !== user.userId) {
      throw new ForbiddenException('You can only edit your own garents');
    }

    return this.prisma.garent.update({
      where: { garentId:GarentId },
      data: { ...dto },
    });
  }

  async deleteGarent(garentId: number, user: JwtUser) {
    const garent = await this.prisma.garent.findUnique({ where: { garentId } });

    if (!garent) {
      throw new NotFoundException('garent not found');
    }

    if (!user.roles.includes('Admin') && garent.userUserId !== user.userId) {
      throw new ForbiddenException('You can only delete your own garents');
    }

    return this.prisma.garent.delete({ where: { garentId } });
  }

  async getGarents(user: JwtUser) {
    if (user.roles.includes('Admin')) {
      return this.prisma.garent.findMany();
    }

    return this.prisma.garent.findMany({
      where: { userUserId: user.userId },
    });
  }
}
