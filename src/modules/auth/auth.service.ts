import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async validateUserByEmail(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Sai thông tin đăng nhập');
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new UnauthorizedException('Sai thông tin đăng nhập');
    user.last_login_at = new Date();
    await this.userRepository.save(user);
    return user;
  }

  async createUser(payload: { email: string; password: string }): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email: payload.email } });
    if (existing) {
      throw new ConflictException('Email đã tồn tại');
    }
    const hash = await bcrypt.hash(payload.password, 10);
    const user = this.userRepository.create({
      email: payload.email,
      password_hash: hash,
      full_name: '',
      phone: String(Date.now()),
      role_worker: false,
      role_employer: false,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
      last_login_at: new Date(),
    });
    return this.userRepository.save(user);
  }
  // bỏ toàn bộ luồng email xác minh
}
