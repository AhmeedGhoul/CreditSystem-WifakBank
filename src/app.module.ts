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
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './config/logging.interceptor';
import { ActivityLogModule } from './activity_log/activity_log.module';
import { ActivityLogController } from './activity_log/activity_log.controller';
import { ActivityLogService } from './activity_log/activity_log.service';
import { CreditPoolService } from './contract/credit_pool/credit_pool.service';
import { CreditPoolModule } from './contract/credit_pool/credit_pool.module';
import { StripeModule } from './stripe/stripe.module';
import { CreditPoolPaymentModule } from './contract/credit_pool_payment/credit_pool_payment.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationModule } from './notification/notification.module';
import { MailerModule } from '@nestjs-modules/mailer';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // SSL
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      },
      defaults: {
        from: `"Your App Name" <${process.env.GMAIL_USER}>`,
      },

    }),
    PrismaModule,
    UserModule,
    RequestModule,
    GarentModule,
    AccountModule,
    ContractModule,
    ActivityLogModule,
    CreditPoolModule,
    StripeModule,
    CreditPoolPaymentModule,
    NotificationModule,
  ],
  controllers: [AppController, ActivityLogController],
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