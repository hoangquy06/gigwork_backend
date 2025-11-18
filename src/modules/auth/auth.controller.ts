import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUserByEmail(
      body.email,
      body.password,
    );
    if (!user) {
      return { message: 'Invalid credentials' };
    }
    const payload = {
      sub: user.user_id,
      email: user.email,
      role_worker: user.role_worker,
      role_employer: user.role_employer,
    };
    const access_token = await this.jwtService.signAsync(payload);
    return { access_token };
  }

  @Post('signup')
  async signup(@Body() body: SignupDto) {
    const user = await this.authService.createUser({
      email: body.email,
      password: body.password,
      full_name: body.full_name,
      phone: body.phone,
      role_worker: body.role_worker,
      role_employer: body.role_employer,
    });
    return {
      message: 'Đăng ký thành công',
      user_id: user.user_id,
      email: user.email,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@Req() req: any) {
    return { user: req.user };
  }

  // Xoá verify-email và resend-verification theo yêu cầu
}
