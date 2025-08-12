import { Module } from '@nestjs/common';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { DocumentModule } from './document/document.module';

@Module({
  controllers: [RequestController],
  providers: [RequestService],
  imports: [DocumentModule],
  exports:[RequestService]
})
export class RequestModule {}
