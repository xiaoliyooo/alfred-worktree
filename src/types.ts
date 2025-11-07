export interface Project {
  name: string;
  root: string;
  cmd: string;
  cmdPath?: (rootPath: string) => string;
  checkRunningPath?: (rootPath: string) => string;
  isProjectProcess: (stat: Stat) => boolean;
}

export interface Config {
  projects: Project[];
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
