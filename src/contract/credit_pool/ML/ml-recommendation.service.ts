import { Injectable } from '@nestjs/common';
import { CreditPoolService } from '../credit_pool.service';
import { RequestService } from '../../../request/request.service';
import axios from 'axios';

@Injectable()
export class MLRecommendationService {
  constructor(
    private readonly creditPoolService: CreditPoolService,
    private readonly requestService: RequestService,
  ) {}

  async buildUserFeatures(userId: number) {
    const request = await this.requestService.findRequestByUserId(userId);

    if (!request) {
      throw new Error(`No request found for user ${userId}`);
    }

    return {
      purpose: request.purpose,
      employmentStatus: request.employmentStatus,
      yearsOfEmployment: request.yearsOfEmployment,
      monthlyIncome: request.monthlyIncome,
      otherIncomeSources: request.otherIncomeSources,
      existingLoans: request.existingLoans,
      totalLoanAmount: request.totalLoanAmount,
      monthlyLoanPayments: request.monthlyLoanPayments,
      numberOfHouses: request.numberOfHouses,
      estimatedHouseValue: request.estimatedHouseValue,
      numberOfCars: request.numberOfCars,
      estimatedCarValue: request.estimatedCarValue,
      bankSavings: request.bankSavings,
      otherAssets: request.otherAssets,
      hasCriminalRecord: request.hasCriminalRecord,
    };
  }
  async fetchAvailablePools() {
    const pools = await this.creditPoolService.findAvailablePools();

    return pools.map(pool => ({
      creditPoolId: pool.creditPoolId,
      maxPeople: pool.maxPeople,
      Frequency: pool.Frequency,
      Period: pool.Period,
      FinalValue: pool.FinalValue,
      isFull: pool.isFull,
    }));
  }
  async requestRecommendations(userId: number, top_k = 4) {
    const userFeatures = await this.buildUserFeatures(userId);
    const pools = await this.fetchAvailablePools();

    const flaskUrl = process.env.ML_FLASK_URL || 'http://127.0.0.1:5001/recommend';

    const resp = await axios.post(
      flaskUrl,
      {
        user: userFeatures,
        credit_pools: pools,
        top_k,
      },
      { timeout: 10000 },
    );

    const recommendedIds = resp.data.map(r => r.creditPoolId);

    const poolsFull = await this.creditPoolService.getPoolsByIds(recommendedIds);
    const idToPool = new Map(poolsFull.map(p => [p.creditPoolId, p]));
    const ordered = recommendedIds.map(id => ({ ...idToPool.get(id) }));

    return { recommended: ordered, rawScores: resp.data };
  }
}
