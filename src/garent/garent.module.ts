import { Module } from '@nestjs/common';
import { GarentController } from './garent.controller';
import { GarentService } from './garent.service';

@Module({
  controllers: [GarentController],
  providers: [GarentService]
})
export class GarentModule {}
