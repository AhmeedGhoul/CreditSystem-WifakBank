import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { RoleSeederService } from './user/role-seeder.service';
import { RequestModule } from './request/request.module';
import { GarentModule } from './garent/garent.module';
import { AccountModule } from './account/account.module';
import { ContractModule } from './contract/contract.module';
import { AccountPaymentModule } from './account/account_payment/account_payment/account_payment.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './config/logging.interceptor';
import { ActivityLogModule } from './activity_log/activity_log.module';
import { ActivityLogController } from './activity_log/activity_log.controller';
import { ActivityLogService } from './activity_log/activity_log.service';
import { CreditPoolController } from './contract/credit_pool/credit_pool.controller';
import { CreditPoolService } from './contract/credit_pool/credit_pool.service';
import { CreditPoolModule } from './contract/credit_pool/credit_pool.module';

// src/app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    RequestModule,
    GarentModule,
    AccountModule,
    ContractModule,
    AccountPaymentModule,
    ActivityLogModule,
    CreditPoolModule,
  ],
  controllers: [AppController,ActivityLogController],
  providers: [
    AppService,
    RoleSeederService,
    ActivityLogService,
    CreditPoolService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}

