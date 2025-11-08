export interface Project {
  name: string;
  root: string;
  cmd: string;
  port: string;
  cmdPath?: (rootPath: string) => string;
}

export type Worktree = {
  root: string;
  HEAD: string;
  branch: string;
  isRunning: boolean;
};

export type Style = {
  titleFormatter?: (project: Project, worktree: Worktree) => string;
  subTitleFormatter?: (project: Project, worktree: Worktree) => string;
};

export type CombinedCtx = {
  project: Project;
  worktrees: Worktree[];
  style: Style;
};

export interface Config {
  projects?: Project[];
  style?: Style;
}

export interface Args {
  branch: string;
  root: string;
  isRunning: boolean;
  cmdPath: string;
  name: string;
}

export interface Stat {
  pid: number;
  ppid?: number;
  uid?: number;
  gid?: number;
  name: string;
  cmd: string;
}
