import { Module } from '@nestjs/common';
import { AccountPaymentController } from './account_payment.controller';

@Module({
  controllers: [AccountPaymentController]
})
export class AccountPaymentModule {}
