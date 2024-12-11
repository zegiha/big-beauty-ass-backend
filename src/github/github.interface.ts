export interface IRepo {
  repo_name: string
  full_repo_name: string
  owner_name: string
  repo_url: string
  last_push: string
}

export type TCompare_code_list = Array<{
  startLine: number,
  contents: Array<string>
}>

export interface ICompare {
  fileName: string,
  before: TCompare_code_list
  after: TCompare_code_list
}

