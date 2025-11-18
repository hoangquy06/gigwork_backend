import { IsEmail, IsString, IsNotEmpty, Matches, IsDateString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmployeeProfileDto {
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

  @ApiProperty({ format: 'date' })
  @IsDateString()
  birth_date: string;

  @ApiProperty({ enum: ['male', 'female', 'other'] })
  @IsIn(['male', 'female', 'other'])
  gender: 'male' | 'female' | 'other';
}