import { Module } from '@nestjs/common';
import { CreditpoolpaymentController } from './credit_pool_payment.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { CreditpoolpaymentService } from './credit_pool_payment.service';

@Module({
  controllers: [CreditpoolpaymentController],
  providers: [CreditpoolpaymentService],
})
export class CreditPoolPaymentModule {}
