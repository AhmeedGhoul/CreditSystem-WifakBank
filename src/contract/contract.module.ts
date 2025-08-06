import { Module } from '@nestjs/common';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreditPoolModule } from './credit_pool/credit_pool.module';

@Module({
  imports: [CreditPoolModule],
  controllers: [ContractController],
  providers: [ContractService, PrismaService],
  exports: [ContractService],
})
export class ContractModule {}