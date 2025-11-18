import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { EmployeeProfile } from '../../entities/employee-profile.entity';
import { EmployerProfile } from '../../entities/employer-profile.entity';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { UpdateEmployerProfileDto } from './dto/update-employer-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(EmployeeProfile) private employeeProfiles: Repository<EmployeeProfile>,
    @InjectRepository(EmployerProfile) private employerProfiles: Repository<EmployerProfile>,
  ) {}

  async updateEmployee(userId: number, dto: UpdateEmployeeProfileDto) {
    const user = await this.users.findOne({ where: { user_id: userId } });
    if (!user) throw new BadRequestException('User không tồn tại');
    if (user.email !== dto.email) throw new BadRequestException('Email không khớp với user hiện tại');
    user.full_name = dto.name;
    user.phone = dto.phone;
    if (user.role_employer) throw new ForbiddenException('User đã chọn role employer');
    user.role_worker = true;
    user.role_employer = false;
    await this.users.save(user);
    let profile = await this.employeeProfiles.findOne({ where: { user_id: userId } });
    if (!profile) {
      profile = this.employeeProfiles.create({ user_id: userId, date_of_birth: dto.birth_date, gender: dto.gender });
    } else {
      profile.date_of_birth = dto.birth_date;
      profile.gender = dto.gender;
    }
    await this.employeeProfiles.save(profile);
    return {
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: 'employee',
      birth_date: profile.date_of_birth,
      gender: profile.gender,
    };
  }

  async updateEmployer(userId: number, dto: UpdateEmployerProfileDto) {
    const user = await this.users.findOne({ where: { user_id: userId } });
    if (!user) throw new BadRequestException('User không tồn tại');
    if (user.email !== dto.email) throw new BadRequestException('Email không khớp với user hiện tại');
    user.full_name = dto.name;
    user.phone = dto.phone;
    if (user.role_worker) throw new ForbiddenException('User đã chọn role employee');
    user.role_employer = true;
    user.role_worker = false;
    await this.users.save(user);
    let profile = await this.employerProfiles.findOne({ where: { user_id: userId } });
    if (!profile) {
      profile = this.employerProfiles.create({ user_id: userId, company_name: dto.company_name, company_address: dto.company_address });
    } else {
      profile.company_name = dto.company_name;
      profile.company_address = dto.company_address;
    }
    await this.employerProfiles.save(profile);
    return {
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: 'employer',
      company_name: profile.company_name,
      company_address: profile.company_address,
    };
  }
}