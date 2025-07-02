import {
  IsDate,
  IsNumber,
  IsString,
  Min,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAccountPaymentDto {
  @Type(() => Date)
  @IsDate({ message: 'date must be a valid Date' })
  date: Date;

  @IsString({ message: 'method must be a string' })
  @Length(1, 50, { message: 'method must be between 1 and 50 characters' })
  method: string;

  @IsNumber({}, { message: 'amount must be a number' })
  @Min(0, { message: 'amount must be non-negative' })
  amount: number;
}
