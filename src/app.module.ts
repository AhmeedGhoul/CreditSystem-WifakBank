import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { RoleSeederService } from './user/role-seeder.service';
import { RequestModule } from './request/request.module';
import { GarentModule } from './garent/garent.module';
import { AccountController } from './account/account.controller';
import { AccountModule } from './account/account.module';
import { ContractService } from './contract/contract.service';
import { ContractModule } from './contract/contract.module';

@Module({
  imports: [UserModule, PrismaModule,ConfigModule.forRoot({isGlobal:true}), RequestModule, GarentModule, AccountModule, ContractModule],
  controllers: [AppController, AccountController],
  providers: [RoleSeederService,AppService, ContractService],
})
export class AppModule {}
