import { Module } from '@nestjs/common';
import { ContractController } from './contract.controller';
import { CreditPoolPaymentController } from './credit_pool_payment/credit_pool_payment.controller';
import { CreditPoolPaymentService } from './credit_pool_payment/credit_pool_payment.service';
import { CreditPoolPaymentModule } from './credit_pool_payment/credit_pool_payment.module';
import { CreditPoolModule } from './credit_pool/credit_pool.module';

@Module({
  controllers: [ContractController, CreditPoolPaymentController],
  providers: [CreditPoolPaymentService],
  imports: [CreditPoolPaymentModule, CreditPoolModule]
})
export class ContractModule {}
