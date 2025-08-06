import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditPoolService } from '../contract/credit_pool/credit_pool.service';
import { JwtUser } from '../user/strategy/jwt-user.interface';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService,private creditPool:CreditPoolService) {}
  async getNotification(user: JwtUser){
    return this.prisma.notification.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}