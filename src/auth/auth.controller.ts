import {Body, Controller, Get, Post, Query} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./auth.dto";
import { LoginDto } from "./auth.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  register(
    @Body() registerDto: RegisterDto,
    @Query('code') code: string
  ): Promise<any> {
    return this.authService.register(registerDto, code);
  }

  @Get('/github/client_id')
  async getGitClientId(): Promise<JSON> {
    const data: { githubRegisterUrl: string } = { githubRegisterUrl: await this.authService.getGitClientId() };
    return JSON.parse(JSON.stringify(data));
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto): Promise<{user_id: string}> {
    const userId = await this.authService.login(loginDto);
    return { user_id: userId };
  }
}
