import { Project, Worktree } from './types';

export const titleFormatter = (project: Project, worktree: Worktree) => {
  const { isRunning } = worktree;
  return `${isRunning ? `🟢` : ''}[${project.name}] -> ${project.cmd}`;
};

export const subTitleFormatter = (project: Project, worktree: Worktree) => {
  const { branch } = worktree;
  return `工作树正在运行 [${branch}] 分支`;
};
