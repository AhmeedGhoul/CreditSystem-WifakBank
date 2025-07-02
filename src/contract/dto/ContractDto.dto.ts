import {
  IsDate,
  IsNumber,
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
  @Min(0, { message: 'deposit must be at least 0' })
  deposit: number;
}
