import {
  IsArray,
  IsEnum, IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { $Enums } from '../../../../generated/prisma';
import AuditStatus = $Enums.AuditStatus;
import AuditType = $Enums.AuditType;

export class CreateAuditDto {
  @IsEnum(AuditStatus)
  auditStatus: AuditStatus;

  @IsString()
  auditOutput: string;

  @IsEnum(AuditType)
  auditType: AuditType;

  @IsArray()
  @IsInt({ each: true })
  activityLogIds: number[];
}
export class ModifyAuditDto {
  @IsEnum(AuditStatus)
  auditStatus?: AuditStatus;

  @IsString()
  auditOutput?: string;

  @IsEnum(AuditType)
  auditType?: AuditType;

  @IsArray()
  @IsInt({ each: true })
  activityLogIds?: number[];
}
