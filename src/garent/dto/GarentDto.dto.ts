import {
  IsString,
  IsInt,
  Length,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateGarentDto {
  @IsString()
  @Length(2, 100, { message: 'First name must be between 2 and 100 characters' })
  firstName: string;

  @IsString()
  @Length(2, 100, { message: 'Last name must be between 2 and 100 characters' })
  lastName: string;

  @IsInt({ message: 'Phone number must be a valid number' })
  @Min(10000000, { message: 'Phone number must be at least 8 digits' })
  @Max(99999999, { message: 'Phone number must be at most 8 digits' })
  phoneNumber: number;
}
