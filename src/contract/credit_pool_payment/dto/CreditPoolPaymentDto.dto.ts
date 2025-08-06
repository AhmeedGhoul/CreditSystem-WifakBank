import { IsBoolean, IsNumber, IsString, Length } from 'class-validator';

export class CreateCreditPoolPaymentDto {
  @IsString()
  PaymentDate: string;

  @IsString()
  MaximumDate: string;

  @IsNumber()
  amount: number;

  @IsBoolean()
  isPayed: boolean;
}
