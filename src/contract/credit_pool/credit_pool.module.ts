import { Module } from '@nestjs/common';
import { CreditPoolService } from './credit_pool.service';
import { CreditPoolController } from './credit_pool.controller';
import { ReplacementRequestService } from './ReplacementRequest.service';

@Module({
  providers: [CreditPoolService,ReplacementRequestService],
  controllers: [CreditPoolController],
  exports:[CreditPoolService,ReplacementRequestService]
})
export class CreditPoolModule {}
