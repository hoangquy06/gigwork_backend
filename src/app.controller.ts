import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { HelloService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    const { username, password } = body;
    // Implement your login logic here
    if (username === 'admin' && password === '123456') {
      return { message: 'Login success' };
    } else {
      return { message: 'Invalid credentials' };
    }
  }
}

@Controller('api/hello')
export class HelloController {
  constructor(private readonly helloService: HelloService) {}

  @Get()
  getHello(): string {
    return this.helloService.getHello();
  }
}
