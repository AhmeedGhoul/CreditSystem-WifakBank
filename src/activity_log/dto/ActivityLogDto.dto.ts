import { IsString } from 'class-validator';

export class CreateActivityLogDto {
  @IsString()
  activityLogName: string;

  @IsString()
  activityLogDescription: string;

  @IsString()
  ipAddress: string;

  @IsString()
  country: string;
}
