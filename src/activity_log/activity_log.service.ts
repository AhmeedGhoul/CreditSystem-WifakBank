import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtUser } from '../user/strategy/jwt-user.interface';
import { CreateActivityLogDto } from './dto/ActivityLogDto.dto';

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateActivityLogDto, userId: number) {
    return this.prisma.activityLog.create({
      data: {
        ...dto,
        activityDate: new Date(),
        userUserId: userId,
      },
    });
  }

  async findAll(user: JwtUser) {
    if (user.roles.includes('Admin')) {
      return this.prisma.activityLog.findMany({
        orderBy: { activityDate: 'desc' },
      });
    }

    return this.prisma.activityLog.findMany({
      where: { userUserId: user.userId },
      orderBy: { activityDate: 'desc' },
    });
  }

  async delete(activityLogId: number, user: JwtUser) {
    const activity = await this.prisma.activityLog.findUnique({ where: { activityLogId } });
    if (!activity) throw new NotFoundException('Activity not found');
    if (!user.roles.includes('Admin') && activity.userUserId !== user.userId) {
      throw new ForbiddenException('You can only delete your own activity logs');
    }

    return this.prisma.activityLog.delete({ where: { activityLogId } });
  }
}
