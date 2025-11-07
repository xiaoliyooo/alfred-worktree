import { getAllProjectsWithWorkTree, isRunningServerInPath, noop } from './utils.js';
import { exec as _exec } from 'child_process';
import util from 'util';
import { Project, Stat } from './types.js';

const exec = util.promisify(_exec);

export const stop = async () => {
  const allWorkTree = await getAllProjectsWithWorkTree();
  const projectWithStatsPromise = allWorkTree
    .map(project => {
      const { worktree, cmdPath = noop, checkRunningPath = noop } = project;
      return worktree.map(workspace => {
        const { root } = workspace;
        return new Promise<{
          project: Project;
          stats: Stat[];
        }>(async resolve => {
          const stats = await isRunningServerInPath(checkRunningPath(root));
          resolve({
            project,
            stats,
          });
        });
      });
    })
    .flat();

  const projectWithStats = await Promise.all(projectWithStatsPromise);

  for (let i = 0; i < projectWithStats.length; i++) {
    const { stats, project } = projectWithStats[i];
    const runningStat = stats.find(stat => project.isProjectProcess(stat));
    if (runningStat) {
      const { pid } = runningStat;
      await exec(`kill -9 ${pid}`);
    }
  }
};

await stop();
