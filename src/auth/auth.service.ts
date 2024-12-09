import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService, private readonly prisma: PrismaService) {}

  async getGitClientId(): Promise<string> {
    return `https://github.com/login/oauth/authorize?client_id=${this.configService.get('GITHUB_CLIENT_ID')}`;
  }

  async login(code: string) {
    const req = {
      code,
      client_id: this.configService.get('GITHUB_CLIENT_ID'),
      client_secret: this.configService.get('GITHUB_CLIENT_SECRET'),
    }

    const res = await fetch('https://github.com/login/oauth/access_token', {
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

    console.log(res);

    return res;
  }
}
