import { Module } from '@nestjs/common';
import { FraudCaseService } from './fraud_case.service';

@Module({
  providers: [FraudCaseService]
})
export class FraudCaseModule {}
