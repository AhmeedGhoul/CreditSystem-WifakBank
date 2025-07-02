import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/RequestDto.dto';
import { JwtUser } from '../user/strategy/jwt-user.interface';

@Injectable()
export class RequestService {
  constructor(private prisma: PrismaService) {}

  async createRequest(dto: CreateRequestDto, userId: number) {
    return this.prisma.request.create({
      data: {
        userUserId: userId,
        ...dto,
      },
    });
  }

  async editRequest(dto: CreateRequestDto, requestId: number, user: JwtUser) {
    const request = await this.prisma.request.findUnique({ where: { requestId } });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (!user.roles.includes('Admin') && request.userUserId !== user.userId) {
      throw new ForbiddenException('You can only edit your own requests');
    }

    return this.prisma.request.update({
      where: { requestId },
      data: { ...dto },
    });
  }

  async deleteRequest(requestId: number, user: JwtUser) {
    const request = await this.prisma.request.findUnique({ where: { requestId } });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (!user.roles.includes('Admin') && request.userUserId !== user.userId) {
      throw new ForbiddenException('You can only delete your own requests');
    }

    return this.prisma.request.delete({ where: { requestId } });
  }

  async getRequests(user: JwtUser) {
    if (user.roles.includes('Admin')) {
      return this.prisma.request.findMany();
    }

    return this.prisma.request.findMany({
      where: { userUserId: user.userId },
    });
  }
}
