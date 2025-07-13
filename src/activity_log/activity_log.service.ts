import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtUser } from '../user/strategy/jwt-user.interface';
import { CreateActivityLogDto } from './dto/ActivityLogDto.dto';

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateActivityLogDto, userId?: number) {
    return this.prisma.activityLog.create({
      data: {
        ...dto,
        activityDate: new Date(),
        userUserId: userId,
      },
    });
  }

  async searchActivityLogs(query: {
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string | string[];
    page?: string;
    size?: string;
  }, user: JwtUser) {
    const { search, startDate, endDate, sortBy, page = '1', size = '10' } = query;

    const filters: any = {};
    if (!user.roles.includes('Admin')) filters.userUserId = user.userId;

    if (search) {
      filters.OR = [
        { activityLogName: { contains: search, mode: 'insensitive' } },
        { activityLogDescription: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      filters.activityDate = {};
      if (startDate) filters.activityDate.gte = new Date(startDate);
      if (endDate) filters.activityDate.lte = new Date(endDate);
    }

    const orderBy = (typeof sortBy === 'string' ? [sortBy] : sortBy || []).map(s => {
      const [key, dir = 'asc'] = s.split(':');
      return { [key]: dir.toLowerCase() === 'desc' ? 'desc' : 'asc' };
    });

    const [data, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where: filters,
        skip: (parseInt(page) - 1) * parseInt(size),
        take: parseInt(size),
        orderBy
      }),
      this.prisma.activityLog.count({ where: filters }),
    ]);

    return {
      data,
      total,
      page: parseInt(page),
      size: parseInt(size),
      totalPages: Math.ceil(total / parseInt(size))
    };
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
