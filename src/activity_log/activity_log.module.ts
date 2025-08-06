import { Module } from '@nestjs/common';
import { ActivityLogService } from './activity_log.service';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [ActivityLogService],
  exports: [ActivityLogService],
})
export class ActivityLogModule {}
