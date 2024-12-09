import { Controller, Get, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/login')
  login(@Query('code') code: string) {
    return this.authService.login(code);
  }

  @Get('/github/client_id')
  async getGitClientId(): Promise<JSON> {
    const data: { githubRegisterUrl: string } = { githubRegisterUrl: await this.authService.getGitClientId() };
    console.log(JSON.parse(JSON.stringify(data)))
    return JSON.parse(JSON.stringify(data));
  }
}

