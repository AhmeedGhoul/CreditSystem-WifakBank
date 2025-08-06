import {
  IsString,
  IsEmail,
  IsInt,
  Min,
  IsBoolean,
  IsEnum,
  IsDate,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CivilStatus } from '../../../generated/prisma';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsInt()
  @Min(18)
  age: number;

  @IsString()
  adress: string;

  @IsInt()
  phoneNumber: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  userScore?: number;
  @IsOptional()
  @IsString()
  Role?: string;

  @IsEnum(CivilStatus)
  civilStatus: CivilStatus;

  @Type(() => Date)
  @IsDate()
  dateOfBirth: Date;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isAccountBlocked?: boolean;
}
export class UserLoginDto {
  email: string;
  password: string;
  keepMeLoggedIn: boolean;
}
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  age?: number;

  @IsOptional()
  @IsString()
  adress?: string;

  @IsOptional()
  @IsInt()
  phoneNumber?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  userScore?: number;
  @IsOptional()
  @IsEnum(CivilStatus)
  civilStatus?: CivilStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

}
export class GrantRoleDto {
  @IsString()
  @IsNotEmpty()
  roleName: string;
}
export class RequestPasswordResetDto {
  @IsEmail()
  email: string;
}