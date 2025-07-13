import { Module } from '@nestjs/common';
import { CreditPoolService } from './credit_pool.service';
import { CreditPoolController } from './credit_pool.controller';

@Module({
  providers: [CreditPoolService],
  controllers: [CreditPoolController],
  exports:[CreditPoolService]
})
export class CreditPoolModule {}
