import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCreditPoolDto {
  @IsNumber({}, { message: 'minValue must be a number' })
  minValue: number;

  @IsNumber({}, { message: 'maxValue must be a number' })
  maxValue: number;

  @IsBoolean({ message: 'isFull must be a boolean' })
  isFull: boolean;

  @IsInt({ message: 'numberOfPeople must be an integer' })
  numberOfPeople: number;

  @Type(() => Date)
  @IsDate({ message: 'openDate must be a valid date' })
  openDate: Date;

  @Type(() => Date)
  @IsDate({ message: 'closeDate must be a valid date' })
  closeDate: Date;
}
