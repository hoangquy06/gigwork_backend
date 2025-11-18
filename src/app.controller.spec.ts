import { Test, TestingModule } from '@nestjs/testing';
import { AppController, HelloController } from './controller/app.controller';
import { AppService } from './app.service';
import { HelloService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});

describe('HelloController', () => {
  let helloController: HelloController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HelloController],
      providers: [HelloService],
    }).compile();

    helloController = app.get<HelloController>(HelloController);
  });

  describe('root', () => {
    it('should return "Hello NestJS!"', () => {
      expect(helloController.getHello()).toBe('Hello NestJS!');
    });
  });
});
