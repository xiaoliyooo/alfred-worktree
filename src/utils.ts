import { exec as _exec } from 'child_process';
import config from './worktree.config.js';
import util from 'util';
import { Config, Project } from './types.js';
import find from 'find-process';

const exec = util.promisify(_exec);

const { projects: projectConfig } = config as Config;

export const isRunningServerInPath = async (path: string) => {
  return find('name', path);
};

export const noop = (path: string) => path;

export type Worktree = {
  root: string;
  HEAD: string;
  branch: string;
  isRunning: boolean;
};

export async function parseWorktreePorcelain(output: string, project: Project) {
  const { checkRunningPath = noop } = project;
  const blocks = output.trim().split(/\n\s*\n/);
  const result: Worktree[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const lines = block.split('\n');
    const worktree: Worktree = {
      root: '',
      HEAD: '',
      branch: '',
      isRunning: false,
    };

    lines.forEach(line => {
      const [subject, value] = line.split(' ');
      switch (subject) {
        case 'worktree':
          worktree.root = value;
          break;
        case 'HEAD':
          worktree.HEAD = value;
          break;
        case 'branch':
          worktree.branch = value.replace('refs/heads/', '');
          break;
      }
    });

    const stats = await isRunningServerInPath(checkRunningPath(worktree.root));
    worktree.isRunning = !!stats.find(stat => {
      return project.isProjectProcess(stat);
    });

    result.push(worktree);
  }

  return result;
}

export const getAllProjectsWithWorkTree = async () => {
  const allProjectsWithWorkTree = projectConfig.map(async project => {
    return new Promise<Project & { worktree: Worktree[] }>(async resolve => {
      const gitOutput = (await exec(`cd ${project.root} && git worktree list --porcelain`)).stdout;
      const worktree = await parseWorktreePorcelain(gitOutput, project);
      resolve({
        ...project,
        worktree,
      });
    });
  });

  return Promise.all(allProjectsWithWorkTree);
};
