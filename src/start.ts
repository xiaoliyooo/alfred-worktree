import { getSelectedWorktreeAndProject, killProcessOnPort } from './utils.js';
import { exec as _exec } from 'child_process';
import util from 'util';
import { Args } from './types.js';

const exec = util.promisify(_exec);
const arg: Args = JSON.parse(process.argv.slice(2)[0]);

const start = async () => {
  const { cmdPath } = arg;
  const selected = await getSelectedWorktreeAndProject(arg);

  if (selected) {
    const { project } = selected;
    await killProcessOnPort(project.port);
    await exec(`cd ${cmdPath} && ${project.cmd}`);
  }
};

await start();
