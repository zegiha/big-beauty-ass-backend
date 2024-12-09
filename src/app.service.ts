import { Injectable } from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService, private readonly prismaService: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }
  async testEnv(): Promise<string> {
    return this.configService.get<string>('DATABASE_USER');
  }
  //
  // async test_db_create(user_name: string): Promise<{id: string, user_name: string}> {
  //   return await this.prismaService.user.create({
  //     data: {
  //       user_name: user_name,
  //     }
  //   })
  // }
}
