import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsBoolean,
  Matches,
} from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @Matches(/^\d{9,15}$/)
  phone?: string;

  @IsOptional()
  @IsBoolean()
  role_worker?: boolean;

  @IsOptional()
  @IsBoolean()
  role_employer?: boolean;
}
