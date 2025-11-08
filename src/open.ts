import { exec as _exec } from 'child_process';
import util from 'util';
import { configFilePath, ensureConfigExist } from './config.js';

const exec = util.promisify(_exec);

const openConfig = async () => {
  ensureConfigExist();
  await exec(`open -t ${configFilePath}`);
};

await openConfig();
