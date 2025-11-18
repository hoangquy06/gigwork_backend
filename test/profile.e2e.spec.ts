import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './app.module';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter';

describe('Auth + Profile E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new DatabaseExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('signup + login + update employee profile', async () => {
    const email = `e2e${Date.now()}@example.com`;
    const password = 'P@ssw0rd123';

    const signupRes = await request(app.getHttpServer()).post('/auth/signup').send({ email, password }).expect(201);
    expect(signupRes.body.email).toBe(email);
    expect(signupRes.body.user_id).toBeDefined();

    const loginRes = await request(app.getHttpServer()).post('/auth/login').send({ email, password }).expect(201);
    expect(loginRes.body.access_token).toBeDefined();
    const token = loginRes.body.access_token as string;

    const employeeBody = {
      name: 'Nguyen Van E2E',
      email,
      phone: '0912345678',
      birth_date: '1995-01-02',
      gender: 'male' as const,
    };

    const empRes = await request(app.getHttpServer())
      .put('/profile/employee')
      .set('Authorization', `Bearer ${token}`)
      .send(employeeBody)
      .expect(200);

    expect(empRes.body.role).toBe('employee');
    expect(empRes.body.email).toBe(email);
    expect(empRes.body.birth_date).toBe('1995-01-02');
    expect(empRes.body.gender).toBe('male');
  });

  it('signup + login + update employer profile', async () => {
    const email = `e2e_emp${Date.now()}@example.com`;
    const password = 'P@ssw0rd123';

    const signupRes = await request(app.getHttpServer()).post('/auth/signup').send({ email, password }).expect(201);
    expect(signupRes.body.email).toBe(email);
    expect(signupRes.body.user_id).toBeDefined();

    const loginRes = await request(app.getHttpServer()).post('/auth/login').send({ email, password }).expect(201);
    const token = loginRes.body.access_token as string;

    const employerBody = {
      name: 'Tran Thi E2E',
      email,
      phone: '0987654321',
      company_name: 'ABC Co',
      company_address: '123 Đường X, Quận Y',
    };

    const bizRes = await request(app.getHttpServer())
      .put('/profile/employer')
      .set('Authorization', `Bearer ${token}`)
      .send(employerBody)
      .expect(200);

    expect(bizRes.body.role).toBe('employer');
    expect(bizRes.body.email).toBe(email);
    expect(bizRes.body.company_name).toBe('ABC Co');
    expect(bizRes.body.company_address).toBe('123 Đường X, Quận Y');
  });
});