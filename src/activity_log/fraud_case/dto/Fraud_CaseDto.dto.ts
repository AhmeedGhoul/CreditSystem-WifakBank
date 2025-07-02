
// dto/FraudCaseDto.dto.ts
import { IsEnum } from 'class-validator';
import { $Enums } from '../../../../generated/prisma';
import FraudCaseType = $Enums.FraudCaseType;
import CaseStatus = $Enums.CaseStatus;
export class CreateFraudCaseDto {
  @IsEnum(FraudCaseType)
  fraudCaseType: FraudCaseType;

  @IsEnum(CaseStatus)
  caseStatus: CaseStatus;
}

