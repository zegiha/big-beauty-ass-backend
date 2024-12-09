import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {PrismaService} from "../../prisma/prisma.service";
import {RegisterDto} from "./auth.dto";

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService, private readonly prisma: PrismaService) {}

  async getGitClientId(): Promise<string> {
    return `https://github.com/login/oauth/authorize?client_id=${this.configService.get('GITHUB_CLIENT_ID')}`;
  }

  async register(registerDto: RegisterDto, code: string): Promise<any> {
    const githubAccessToken = await this.getGithubAccessToken(code);
    this.prisma.user.create({
      data: {
        user_email: registerDto.user_email,
        user_password: registerDto.user_password,
        user_name: registerDto.user_name,
        github_access_token: githubAccessToken,
      }
    })
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
}
