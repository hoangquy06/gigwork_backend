import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { EmployeeProfile } from '../../entities/employee-profile.entity';
import { EmployerProfile } from '../../entities/employer-profile.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, EmployeeProfile, EmployerProfile])],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}