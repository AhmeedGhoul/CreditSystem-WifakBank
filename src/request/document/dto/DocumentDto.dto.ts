import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDocumentDto {
  @Type(() => Date)
  @IsDate()
    documentDate: Date;

  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

}
