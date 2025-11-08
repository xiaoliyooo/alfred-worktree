export interface Project {
  name: string;
  root: string;
  cmd: string;
  port: string;
  cmdPath?: (rootPath: string) => string;
}

export interface Config {
  projects?: Project[];
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
