import { Module } from '@nestjs/common';

import { MLRecommendationService } from './ml-recommendation.service';
import { MLRecommendationController } from './ml-recommendation.controller';
import { CreditPoolModule } from '../credit_pool.module';
import { RequestModule } from '../../../request/request.module';

@Module({
  imports: [CreditPoolModule, RequestModule],
  providers: [MLRecommendationService],
  controllers: [MLRecommendationController],
  exports:[MLRecommendationService]
})
export class MLRecommendationModule {}
