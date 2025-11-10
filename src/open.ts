import { exec as _exec } from 'child_process';
import util from 'util';
import { configFilePath, getConfig } from './config.js';
import { Opener } from './types.js';

const exec = util.promisify(_exec);
const transformOpenCommand = (opener: Opener | undefined, targetPath: string) => {
  if (opener === 'vscode') opener = 'code';

  if (opener && ['code'].includes(opener)) {
    return `${opener} ${targetPath}`;
  }

  return `open -t ${targetPath}`;
};

const openConfig = async () => {
  const config = await getConfig();
  await exec(transformOpenCommand(config.opener, configFilePath));
};

await openConfig();
