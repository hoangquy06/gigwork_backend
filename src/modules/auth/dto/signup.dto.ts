import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ format: 'email' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}