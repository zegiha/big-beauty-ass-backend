import {Injectable} from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { IUser } from "./interface/user.interface";

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getProfile(user_id: string): Promise<IUser> {
    const {user_name, github_access_token} = await this.prismaService.user.findUnique({
      where: {id: user_id}
    });

    const githubProfile = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${github_access_token}`
      }
    }).then(res => res.json());


    return {
      name: user_name,
      github_username: githubProfile.login,
      github_profile_image: githubProfile.avatar_url,
    };
  }
}
