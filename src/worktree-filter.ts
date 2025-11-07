import alfy, { ScriptFilterItem } from 'alfy';
import { noop, getAllProjectsWithWorkTree } from './utils.js';
import { exec as _exec } from 'child_process';

const alfredList: ScriptFilterItem[] = [];

async function run() {
  const allProjectsWithWorkTree = await getAllProjectsWithWorkTree();

  allProjectsWithWorkTree.forEach(project => {
    const { worktree, cmdPath = noop } = project;

    worktree.forEach(workspace => {
      const { isRunning, branch, root } = workspace;
      alfredList.push({
        title: `${project.name}: ${isRunning ? `✅` : ''} ${branch} -> ${project.cmd}`,
        subtitle: `基于 ${branch} 分支创建的工作树`,
        arg: JSON.stringify({
          branch,
          root,
          isRunning,
          cmdPath: cmdPath(root),
          name: project.name,
        }),
      });
    });
  });

  alfy.output(alfredList);
}

await run();
