import {
  IsDate,
  IsNumber, IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContractDto {
  @Type(() => Date)
  @IsDate({ message: 'contractDate must be a valid date' })
  contractDate: Date;

  @IsNumber({}, { message: 'amount must be a number' })
  @Min(0, { message: 'amount must be at least 0' })
  amount: number;

  @IsNumber({}, { message: 'deposit must be a number' })
  @Min(0, { message: 'period must be at least 1' })
  period: number;
  @IsString()
  pdfUrl: string;
  creditPoolId: number;
  rank: number;
}
