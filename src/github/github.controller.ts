import {Controller, Get, Post, Body} from "@nestjs/common";
import {GithubService} from "./github.service";
import {UserId} from "../auth/user-id.decorator";
import {IRepo, ICompare} from "./github.interface";
import { CreatePrDto } from "./github.dto";

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}
  @Get('/repo/recent')
  async getRecentRepos(@UserId() userId: string): Promise<Array<IRepo>> {
    return await this.githubService.getRecentRepos(userId);
  }

  @Get('/commits')
  async getCommits(@UserId() userId: string) {
    return await this.githubService.getCommits(userId);
  }

  @Get('/commit/compare')
  async getCompare(@UserId() userId: string): Promise<Array<ICompare | 'empty file'>> {
    return await this.githubService.getCommitCompare(userId);
  }

  @Get('/pr/recent')
  async getRecentPr(@UserId() userId: string) {
    return await this.githubService.getRecentPr(userId);
  }

  @Post('/pr/create')
  async createPr(@Body() createPrDto: CreatePrDto, @UserId() userId: string,) {
    return await this.githubService.createPr(userId, createPrDto);
  }
}