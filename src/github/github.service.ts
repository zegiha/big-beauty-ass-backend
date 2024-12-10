import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../prisma/prisma.service";
import {IRepo} from "./github.interface";

@Injectable()
export class GithubService {
  constructor(private readonly prisma: PrismaService) {}

  async getRepos(user_id: string): Promise<Array<IRepo>> {
    const {github_access_token} = await this.prisma.user.findUnique({
      where: {id: user_id},
    });
    return await fetch(
      'https://api.github.com/user/repos?sort=pushed',
      {
        headers: {
          Authorization: `token ${github_access_token}`
        },
      }
    ).then(async res => res.json())
      .then(res => (res.map(v => ({
        repo_name: v.name,
        full_repo_name: v.full_name,
        owner_name: v.owner.login,
        repo_url: v.html_url,
        last_push: v.pushed_at,
      })))).then(res => res.slice(0, 10));
    /*
    const orgs = await fetch(
      'https://api.github.com/users/zegiha/orgs',
      {
        method: 'GET',
        headers: {
          Authorization: `token ${github_access_token}`
        }
      }
    ).then(res => res.json());
    
    console.log(orgs)
    */
  }

  async getCommits(user_id: string) {
    const repos = await this.getRepos(user_id).then(res => res.slice(0, 3));
    const {github_access_token} = await this.prisma.user.findUnique({
      where: {id: user_id},
    });
    const commits = await Promise.all(repos.map(async repo => {
      const commit = await fetch(
        `https://api.github.com/repos/${repo.owner_name}/${repo.repo_name}/commits`,
        {
          headers: {
            Authorization: `token ${github_access_token}`
          }
        }
      ).then(res => res.json());
      return commit.slice(0, 2);
    }))
    return commits;
  }

  async getCommitCompare(user_id: string) {
    const repo = await this.getRepos(user_id).then(res => res[2]);
    const commit = await this.getCommits(user_id).then(res => res[2]);
    const {github_access_token} = await this.prisma.user.findUnique({
      where: {id: user_id},
    });
    const compare = await fetch(
      `https://api.github.com/repos/${repo.owner_name}/${repo.repo_name}/compare/${commit[1].sha}...${commit[0].sha}`,
      {
        headers: {
          Authorization: `token ${github_access_token}`
        }
      }
    ).then(res => res.json());
    interface ICompare {
      fileName: string,
      before: Array<{
        startLine: number,  
        contents: Array<string>
      }>
      after: Array<{
        startLine: number,
        contents: Array<string>
      }>
    }
    const compareData: Array<ICompare> = compare.files.map((v) => {
      const fileName = v.filename;
      if(fileName.includes('lock')) {
        if(v.patch) {
          return this.processDiffFile(v.patch);
        }
        return 'empty file';
      }
    });
    return compareData;
  }

  private parseDiffHeader(line: string): DiffInfo | null {
    const match = line.match(/@@ -(\d+),(\d+) \+(\d+),(\d+) @@/);
    if (!match) return null;

    return {
      beforeStartLine: parseInt(match[1], 10),
      beforeLineCount: parseInt(match[2], 10),
      afterStartLine: parseInt(match[3], 10),
      afterLineCount: parseInt(match[4], 10),
    };
  }

  private processDiffFile(patch: string): ICompareResult | 'empty file' {
    const lines = patch.split('\n');
    let currentDiffInfo: DiffInfo | null = null;

    // 모든 라인을 순회하면서 diff 헤더 찾기
    for (const line of lines) {
      const diffInfo = this.parseDiffHeader(line);
      if (diffInfo) {
        currentDiffInfo = diffInfo;
        break;
      }
    }

    if (!currentDiffInfo) {
      return 'empty file';
    }

    const beforeContents = lines.slice(1).filter(line => line[0] !== '+');
    const afterContents = lines.slice(1).filter(line => line[0] !== '-');

    return {
      fileName,
      before: {
        startLine: currentDiffInfo.beforeStartLine,
        contents: beforeContents
      },
      after: {
        startLine: currentDiffInfo.afterStartLine,
        contents: afterContents
      }
    };
  }
}

    });
    return compare;
  }
}
