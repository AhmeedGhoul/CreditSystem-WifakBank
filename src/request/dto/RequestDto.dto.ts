import {
  IsOptional,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsString,
  IsArray,
  ArrayNotEmpty, IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

enum Employment {
  Employed = 'Employed',
  Self_Employed = 'Self_Employed',
  Unemployed = 'Unemployed',
  Student = 'Student',
}

export class CreateDocumentDto {
  @Type(() => Date)
  @IsDate()
  documentDate: Date;


  @IsNotEmpty()
  @IsString()
  originalName: string;

  @IsNotEmpty()
  @IsString()
  filePath: string;

  @IsNotEmpty()
  @IsString()
  mimeType: string;

  @IsNotEmpty()
  @IsInt()
  size: number;
}

export class CreateRequestDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  requestDate?: Date;

  @IsOptional()
  @IsBoolean()
  isRequestApproved?: boolean;

  @IsString()
  purpose?: string;

  @IsEnum(Employment)
  employmentStatus?: Employment;

  @IsInt()
  yearsOfEmployment?: number;

  @IsNumber()
  monthlyIncome?: number;

  @IsString()
  otherIncomeSources?: string;

  @IsBoolean()
  existingLoans?: boolean;

  @IsNumber()
  totalLoanAmount?: number;

  @IsNumber()
  monthlyLoanPayments?: number;

  @IsInt()
  numberOfHouses?: number;

  @IsNumber()
  estimatedHouseValue?: number;

  @IsInt()
  numberOfCars?: number;

  @IsNumber()
  estimatedCarValue?: number;

  @IsNumber()
  bankSavings?: number;

  @IsString()
  otherAssets?: string;

  @IsBoolean()
  hasCriminalRecord?: boolean;

  @IsOptional()
  @IsArray()
  documents?: CreateDocumentDto[];
}
