export interface IRepo {
  repo_name: string
  full_repo_name: string
  owner_name: string
  repo_url: string
  last_push: string
}

export interface ICompare {
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
