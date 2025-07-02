import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRequestDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  requestDate?: Date;

  @IsOptional()
  @IsBoolean()
  isRequestApproved?: boolean;

}
