import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../prisma/prisma.service";
import {ICompare, IRepo, TCompare_code_list} from "./github.interface";
import { CreatePrDto } from "./github.dto";

@Injectable()
export class GithubService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecentRepos(user_id: string): Promise<Array<IRepo>> {
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
    const repos = await this.getRecentRepos(user_id).then(res => res.slice(0, 3));
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
    const repo = await this.getRecentRepos(user_id).then(res => res[0]);
    const commit = await this.getCommits(user_id).then(res => res[0]);
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

    const compareData: Array<ICompare | 'empty file'> = compare.files.map((v) => {
      const fileName = v.filename;
      const before: TCompare_code_list = [];
      const after: TCompare_code_list = [];

      if(fileName.includes('lock')) return 'empty file';
      if(!v.patch) return 'empty file';

      const file = v.patch.split('\n');
      file.forEach(line => {
        const diffInfo = this.parseDiffHeader(line);
        if(diffInfo) {
          before.push({startLine: diffInfo.beforeStartLine, contents: []});
          after.push({startLine: diffInfo.afterStartLine, contents: []});
          if(diffInfo.additionalInfo !== '') {
            if(diffInfo.additionalInfo[0] !== '-') {
              after[after.length - 1].contents.push(diffInfo.additionalInfo);
            }
            if(diffInfo.additionalInfo[0] !== '+') {
              before[before.length - 1].contents.push(diffInfo.additionalInfo);
            }
          }
        } else {
          if(line[0] !== '-') {
            after[after.length - 1].contents.push(line);
          }
          if(line[0] !== '+') {
            before[before.length - 1].contents.push(line);
          }
        }
      })

      return {
        fileName,
        before,
        after
      }
    });
    return compareData;
  }
  
  private parseDiffHeader(header: string): {
    beforeStartLine: number;
    afterStartLine: number;
    additionalInfo: string;
  } | null {
    // @@ -n1,m1 n2,m2 @@ 형식 파싱
    const regex = /^@@ -(\d+),\d+ \+(\d+),\d+ @@(.*)$/;
    const match = header.match(regex);
  
    if (!match) {
      return null
    }
  
    return {
      beforeStartLine: parseInt(match[1]),
      afterStartLine: parseInt(match[2]),
      additionalInfo: match[3].trim()
    };
  }

  async getRecentPr(user_id: string) {
    const {github_access_token} = await this.prisma.user.findUnique({
      where: {id: user_id},
    });
    const repo = await this.getRecentRepos(user_id).then(res => res[0]);
    const prs = await fetch(
      `https://api.github.com/repos/${repo.owner_name}/${repo.repo_name}/pulls`,
      {
        headers: {
          Authorization: `token ${github_access_token}`
        }
      }
    ).then(res => res.json());
    console.log(repo.repo_name);
    return prs;
  }

  async createPr(user_id: string, createPrDto: CreatePrDto) {
    const {
      repo_owner,
      repo_name,
      push_branch,
      pull_branch,
      pull_title,
      pull_body,
      value,
      q1,
      q2,
      pointed_user_id
    } = createPrDto;
    const {github_access_token} = await this.prisma.user.findUnique({
      where: {id: user_id},
    });
    const {login} = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${github_access_token}`
      }
    }).then(res => res.json());
    const pr = await fetch(
      `https://api.github.com/repos/${repo_owner}/${repo_name}/pulls`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `token ${github_access_token}`
        },
        body: JSON.stringify({
          title: pull_title,
          head: `${login}:${push_branch}`,
          base: pull_branch,
          body: pull_body,
        })
      }
    ).then(res => res.json());
    await this.prisma.pr.create({
      data: {
        user_id: pointed_user_id,
        value: value,
        repo_id: String(pr.id),
        repo_name: repo_name,
        repo_owner: repo_owner,
        push_branch: push_branch,
        pull_branch: pull_branch,
        pull_number: String(pr.number),
        q1: q1,
        q2: q2,
      }
    })
    return pr;
  }
}

