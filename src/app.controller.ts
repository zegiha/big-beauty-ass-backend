import {Body, Controller, Get, Post} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('/test-env')
  testEnv(): Promise<string> {
    return this.appService.testEnv();
  }
  @Post('/test-db-create')
  test_db_create(@Body('user_name') user_name: string): Promise<{id: string, user_name: string}> {
    return this.appService.test_db_create(user_name);
  }
}
