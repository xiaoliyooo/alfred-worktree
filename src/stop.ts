import {
  getCombinedContextList,
  getSelectedWorktreeAndProject,
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
  const selected = (await getSelectedWorktreeAndProject(arg))!;
  const { project } = selected;
  return killProcessOnPort(project.port);
};

const stopAll = async () => {
  const ctxList = await getCombinedContextList();
  return Promise.all(ctxList.map(ctx => killProcessOnPort(ctx.project.port)));
};

await stop();
