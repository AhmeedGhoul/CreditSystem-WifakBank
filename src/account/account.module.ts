import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  providers: [AccountService],
  imports: [StripeModule],
  controllers: [AccountController]
})
export class AccountModule {}
