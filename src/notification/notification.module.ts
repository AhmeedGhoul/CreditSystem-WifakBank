import { Module } from '@nestjs/common';
import { JwtUser } from '../user/strategy/jwt-user.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from './notification.service';
import { NotificationsController } from './notifications.controller';
import { CreditPoolModule } from '../contract/credit_pool/credit_pool.module';


@Module({
  imports: [CreditPoolModule],
  controllers: [NotificationsController],
  providers: [NotificationService, PrismaService],
  exports: [NotificationService],
})
export class NotificationModule {

}