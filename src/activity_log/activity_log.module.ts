import { Module } from '@nestjs/common';
import { ActivityLogService } from './activity_log.service';
import { AuditModule } from './audit/audit.module';
import { FraudCaseModule } from './fraud_case/fraud_case.module';

@Module({
  imports: [AuditModule, FraudCaseModule],
  providers: [ActivityLogService],
  exports: [ActivityLogService],
})
export class ActivityLogModule {}
