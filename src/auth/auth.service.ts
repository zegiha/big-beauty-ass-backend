import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {PrismaService} from "../../prisma/prisma.service";
import {RegisterDto} from "./auth.dto";
import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService, private readonly prisma: PrismaService) {}

  async getGitClientId(): Promise<string> {
    return `https://github.com/login/oauth/authorize?client_id=${this.configService.get('GITHUB_CLIENT_ID')}&scope=repo admin:org`;
  }

  async register(registerDto: RegisterDto, code: string): Promise<string> {
    const githubAccessToken = await this.getGithubAccessToken(code);
    const {id} = await this.prisma.user.create({
      data: {
        user_email: registerDto.user_email,
        user_password: registerDto.user_password,
        user_name: registerDto.user_name,
        github_access_token: githubAccessToken,
        pr_list: {
          create: []
        },
      }
    })
    return id;
  }

  async getGithubAccessToken(code: string): Promise<string> {
    const req = {
      code,
      client_id: this.configService.get('GITHUB_CLIENT_ID'),
      client_secret: this.configService.get('GITHUB_CLIENT_SECRET'),
    }

    return await fetch('https://github.com/login/oauth/access_token', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(req),
    }).then(async (res) => {
      const data = await res.json();
      return data.access_token;
    });
  }

  async login(loginDto: LoginDto): Promise<string> {
    const user = await this.prisma.user.findFirst({
      where: {
        user_email: loginDto.user_email,
        user_password: loginDto.user_password,
      }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    return user.id;
  }
}
