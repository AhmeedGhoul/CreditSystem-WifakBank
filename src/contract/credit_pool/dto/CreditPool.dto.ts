import { IsInt, IsBoolean, IsEmail } from 'class-validator';

export class CreateCreditPoolDto {
  @IsInt({ message: 'maxPeople must be an integer' })
  maxPeople: number;

  @IsInt({ message: 'Frequency must be an integer' })
  Frequency: number;

  @IsInt({ message: 'Period must be an integer' })
  Period: number;

  @IsInt({ message: 'FinalValue must be an integer' })
  FinalValue: number;

  @IsBoolean({ message: 'isFull must be a boolean' })
  isFull: boolean;
}

export class SendReplacementRequestDto {
  @IsInt()
  creditPoolId: number;

  @IsEmail()
  replacementEmail: string;
}
