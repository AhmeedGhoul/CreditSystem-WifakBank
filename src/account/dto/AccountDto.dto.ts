import {
  IsDate,
  IsNumber,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAccountDto {
  @Type(() => Date)
  @IsDate({ message: 'openDate must be a valid date' })
  openDate: Date;

  @IsNumber({}, { message: 'amount must be a number' })
  @Min(0, { message: 'amount cannot be negative' })
  amount: number;

  @IsInt({ message: 'trackingNumber must be an integer' })
  trackingNumber: number;
}
