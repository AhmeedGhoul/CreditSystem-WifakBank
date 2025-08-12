import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { MLRecommendationService } from './ml-recommendation.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtUser } from '../../../user/strategy/jwt-user.interface';

@Controller('ml')
export class MLRecommendationController {
  constructor(private readonly mlService: MLRecommendationService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('recommend')
  async recommend(@Req() req, @Query('top_k') top_k: string) {
    const user = req.user as JwtUser;
    const topk = top_k ? parseInt(top_k, 10) : 4;
    return this.mlService.requestRecommendations(user.userId, topk);
  }
}