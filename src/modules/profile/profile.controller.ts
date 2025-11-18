import { Controller, Put, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { ProfileService } from './profile.service';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { UpdateEmployerProfileDto } from './dto/update-employer-profile.dto';
import { ApiTags, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Put('employee')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdateEmployeeProfileDto })
  @ApiResponse({ status: 200 })
  async updateEmployee(@Req() req: any, @Body() body: UpdateEmployeeProfileDto) {
    const userId = (req as any).user.user_id;
    return this.profileService.updateEmployee(userId, body);
  }

  @Put('employer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdateEmployerProfileDto })
  @ApiResponse({ status: 200 })
  async updateEmployer(@Req() req: any, @Body() body: UpdateEmployerProfileDto) {
    const userId = (req as any).user.user_id;
    return this.profileService.updateEmployer(userId, body);
  }
}