import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountPaymentModule } from './account_payment/account_payment/account_payment.module';

@Module({
  providers: [AccountService],
  imports: [AccountPaymentModule],
  controllers: []
})
export class AccountModule {}
