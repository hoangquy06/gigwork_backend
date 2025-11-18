import { IsEmail, IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmployerProfileDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ format: 'email' })
  @IsEmail()
  email: string;

  @ApiProperty({ pattern: '^\d{9,15}$' })
  @Matches(/^\d{9,15}$/)
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  company_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  company_address: string;
}