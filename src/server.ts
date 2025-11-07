import { getAllProjectsWithWorkTree } from './utils.js';
import { exec as _exec } from 'child_process';
import util from 'util';
import { Args } from './types.js';
import './stop.js';

const exec = util.promisify(_exec);
const arg: Args = JSON.parse(process.argv.slice(2)[0]);

const start = async () => {
  const { root, cmdPath } = arg;
  const allProjectsWithWorkTree = await getAllProjectsWithWorkTree();
  const project = allProjectsWithWorkTree.find(project => project.name === arg.name);
  if (!project) return;

  const workspace = project.worktree.find(workspace => workspace.root === root);

  if (workspace) {
    await exec(`cd ${cmdPath} && ${project.cmd}`);
  }
};

await start();
