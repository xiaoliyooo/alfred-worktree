import {
  getAllProjectsWithWorkTree,
  getSelectedWorkspaceAndProject,
  killProcessOnPort,
} from './utils.js';

import { Args } from './types.js';
import { exec as _exec } from 'child_process';

const args = process.argv.slice(2);
const arg: Args | null = args.length ? JSON.parse(args[0]) : null;

export const stop = async () => {
  return arg ? stopSelected(arg) : stopAll();
};

const stopSelected = async (arg: Args) => {
  const selected = (await getSelectedWorkspaceAndProject(arg))!;
  const { project } = selected;
  return killProcessOnPort(project.port);
};

const stopAll = async () => {
  const allWorkTree = await getAllProjectsWithWorkTree();
  return Promise.all(allWorkTree.map(project => killProcessOnPort(project.port)));
};

await stop();
