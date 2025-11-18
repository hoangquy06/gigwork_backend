import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ApiTags, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly jwtService: JwtService) {}

  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200 })
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUserByEmail(body.email, body.password);
    if (!user) {
      return { message: 'Invalid credentials' };
    }
    const payload = { sub: user.user_id, email: user.email, role_worker: user.role_worker, role_employer: user.role_employer };
    const access_token = await this.jwtService.signAsync(payload);
    return { access_token };
  }

  @Post('signup')
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: 201 })
  async signup(@Body() body: SignupDto) {
    const user = await this.authService.createUser({ email: body.email, password: body.password });
    return { message: 'Đăng ký thành công', user_id: user.user_id, email: user.email };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200 })
  async profile(@Req() req: any) {
    return { user: (req as any).user };
  }


}
