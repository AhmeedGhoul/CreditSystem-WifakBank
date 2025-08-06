import {
  IsDate,
  IsNumber,
  IsInt,
  Min, IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAccountDto {
  @Type(() => Date)
  @IsDate({ message: 'openDate must be a valid date' })
  openDate: Date;
  
  @IsInt({ message: 'trackingNumber must be an integer' })
  trackingNumber: number;
  @IsOptional()
  stripePaymentIntentId?: string;
}
