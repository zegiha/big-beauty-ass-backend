import {Controller, Get} from "@nestjs/common";
import { UserService } from "./user.service";
import {UserId} from "../auth/user-id.decorator";

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/profile')
  async getProfile(@UserId() userId: string) {
    console.log(userId);
    return await this.userService.getProfile(userId);
  }
}
