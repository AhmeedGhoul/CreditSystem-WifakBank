// src/contract/contract.module.ts
import { Module } from '@nestjs/common';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreditPoolModule } from './credit_pool/credit_pool.module'; // ✅ Prisma is required in the service

@Module({
  imports: [CreditPoolModule],
  controllers: [ContractController],
  providers: [ContractService, PrismaService], // ✅ ADD THIS LINE
  exports: [ContractService], // Optional: only if used in another module
})
export class ContractModule {}