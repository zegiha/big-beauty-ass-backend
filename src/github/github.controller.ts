import {Controller, Get} from "@nestjs/common";
import {GithubService} from "./github.service";
import {UserId} from "../auth/user-id.decorator";
import {IRepo, ICompare} from "./github.interface";

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}
  @Get('/repos')
  async getRepos(@UserId() userId: string): Promise<Array<IRepo>> {
    return await this.githubService.getRepos(userId);
  }

  @Get('/commits')
  async getCommits(@UserId() userId: string) {
    return await this.githubService.getCommits(userId);
  }

  @Get('/commit/compare')
  async getCompare(@UserId() userId: string): Promise<Array<ICompare | 'empty file'>> {
    return await this.githubService.getCommitCompare(userId);
  }
}
