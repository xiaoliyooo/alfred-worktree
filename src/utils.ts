import { exec as _exec } from 'child_process';
import util from 'util';
import { Args, CombinedCtx, Project, Style, Worktree } from './types.js';
import find from 'find-process';
import fs from 'fs';
import path from 'path';
import { getConfig } from './config.js';

const exec = util.promisify(_exec);

export const isRunningServerInPath = async (path: string) => {
  return find('name', path);
};

export const isRunningServerOnPort = async (port: string) => {
  return find('port', port);
};

// 通用的项目进程检测函数
export const isProjectRunningOnPort = async (
  project: Project,
  port: string,
  worktreeRoot: string
) => {
  try {
    const processes = await find('port', port);
    return !!processes.find(process => isProjectProcess(project, process, worktreeRoot));
  } catch (error) {
    console.error(`Failed to check if project is running on port ${port}:`, error);
    return false;
  }
};

export const isProjectProcess = (project: Project, stat: any, worktreeRoot: string): boolean => {
  const { name, cmd } = stat;

  if (name !== 'node') {
    return false;
  }

  if (cmd.includes('cross-env.js')) {
    return false;
  }

  const nodeModulesPath = (path: string) => `${path}/node_modules`;

  const packagePath = project.cmdPath ? project.cmdPath(worktreeRoot) : worktreeRoot;
  const isMonorepo = packagePath !== worktreeRoot;
  const noMonorepo = !isMonorepo && cmd.includes(nodeModulesPath(packagePath));
  const shared = !findBuildTool(packagePath);

  // monorepo且共享构建工具
  const monorepoAndShared =
    isMonorepo &&
    cmd.includes(nodeModulesPath(worktreeRoot)) &&
    !cmd.includes(nodeModulesPath(packagePath)) &&
    shared;

  // monorepo且不共享构建工具
  const monorepoAndIndependent =
    isMonorepo &&
    !cmd.includes(nodeModulesPath(worktreeRoot)) &&
    cmd.includes(nodeModulesPath(packagePath)) &&
    !shared;

  return noMonorepo || monorepoAndShared || monorepoAndIndependent;
};

export const killProcessOnPort = async (port: string) => {
  try {
    const processes = await find('port', port);
    for (const process of processes) {
      if (process.pid) {
        await exec(`kill -9 ${process.pid}`);
      }
    }
    return true;
  } catch (error) {
    console.error(`Failed to kill process on port ${port}:`, error);
    return false;
  }
};

export const noop = (path: string) => path;

export async function parseWorktreePorcelain(
  output: string,
  project: Project,
  portCache: Record<string, boolean>
) {
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

    if (typeof portCache[project.port] === 'undefined') {
      worktree.isRunning = await isProjectRunningOnPort(project, project.port, worktree.root);
      portCache[project.port] = worktree.isRunning;
    } else {
      worktree.isRunning = portCache[project.port];
    }

    result.push(worktree);
  }

  return result;
}

export const getCombinedContextList = async () => {
  const config = await getConfig();
  const portCache: Record<string, boolean> = {};
  const allProjectsWithWorkTree = (config.projects || []).map(async project => {
    return new Promise<CombinedCtx>(async resolve => {
      const gitOutput = (await exec(`cd ${project.root} && git worktree list --porcelain`)).stdout;
      const worktrees = await parseWorktreePorcelain(gitOutput, project, portCache);
      resolve({
        project,
        worktrees,
        style: config.style || {},
      });
    });
  });

  return Promise.all(allProjectsWithWorkTree);
};

/**
 * 读取指定路径下的package.json文件，查找vite或webpack依赖
 */
export const findBuildTool = (
  packagePath: string
): {
  tool: 'vite' | null;
  version?: string;
  devDependency?: boolean;
} | null => {
  try {
    const packageJsonPath = path.join(packagePath, 'package.json');

    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);

    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};

    if (dependencies.vite) {
      return {
        tool: 'vite',
        version: dependencies.vite,
        devDependency: false,
      };
    }

    if (devDependencies.vite) {
      return {
        tool: 'vite',
        version: devDependencies.vite,
        devDependency: true,
      };
    }

    return null;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in package.json at ${packagePath}`);
    }
    throw error;
  }
};

export const getSelectedWorktreeAndProject = async (arg: Args) => {
  const { root } = arg;
  const ctxList = await getCombinedContextList();
  const ctx = ctxList.find(ctx => ctx.project.name === arg.name);
  if (!ctx) return null;

  const worktree = ctx.worktrees.find(worktree => worktree.root === root);
  return {
    project: ctx.project,
    worktree,
  };
};
