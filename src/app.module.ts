import { Module } from '@nestjs/common';
import { AppController, HelloController } from './app.controller';
import { AppService, HelloService } from './app.service';
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { EmployerProfile } from './entities/employer-profile.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { ProfileModule } from './modules/profile/profile.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: String(config.get<string>('DB_HOST', 'localhost')),
        port: parseInt(String(config.get<string>('DB_PORT', '5432'))),
        username: String(config.get<string>('DB_USER', 'postgres')),
        password: String(config.get<string>('DB_PASS', 'Quyandkhoa123@')),
        database: String(config.get<string>('DB_NAME', 'postgres')),
        entities: [User, EmployeeProfile, EmployerProfile],
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'dev_secret',
        signOptions: { expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '1h') as any },
      }),
    }),
    ProfileModule,
  ],
  controllers: [AppController, HelloController, AuthController],
  providers: [AppService, HelloService, AuthService, JwtStrategy],
})
export class AppModule {}
