import { IsString, Length } from 'class-validator';

export class CreateCreditPoolPaymentDto {
  @IsString({ message: 'date must be a string' })
  @Length(1, 50, { message: 'date must be between 1 and 50 characters' })
  date: string;

  @IsString({ message: 'amount must be a string' })
  @Length(1, 50, { message: 'amount must be between 1 and 50 characters' })
  amount: string;
}
