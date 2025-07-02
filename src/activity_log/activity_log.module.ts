import { Module } from '@nestjs/common';
import { ActivityLogService } from './activity_log.service';
import { AuditService } from './audit/audit.service';
import { AuditController } from './audit/audit.controller';
import { AuditModule } from './audit/audit.module';
import { FraudCaseController } from './fraud_case/fraud_case.controller';
import { FraudCaseModule } from './fraud_case/fraud_case.module';

@Module({
  providers: [ActivityLogService, AuditService],
  controllers: [AuditController, FraudCaseController],
  imports: [AuditModule, FraudCaseModule]
})
export class ActivityLogModule {}
