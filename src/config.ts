import fs from 'fs';
import path from 'path';
import os from 'os';

import { Config } from './types';

// 创建默认配置文件内容
export const createDefaultConfigStr = (): string => {
  return `export default {
  projects: [
    // 示例项目配置
    // {
    //   name: 'My Project',
    //   root: '/path/to/your/project',
    //   port: '3000',
    //   cmd: 'npm run https:test',
    //   cmdPath: (worktreeRoot) => worktreeRoot,
    // }
  ],
  opener: '', // 可选值：'' | 'vscode' | 'code'
};
`;
};

export const createDefaultConfig = (): Config => {
  return {
    projects: [],
    opener: '',
  };
};
export const configDir = path.join(os.homedir(), 'alfred-worktree');
export const configFilePath = path.join(configDir, 'worktree.config.js');

export const ensureConfigExist = async () => {
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  if (!fs.existsSync(configFilePath)) {
    const defaultConfig = createDefaultConfigStr();
    fs.writeFileSync(configFilePath, defaultConfig, 'utf-8');
  }
};

export const getConfig = async (): Promise<Config> => {
  try {
    ensureConfigExist();
    const configModule = await import(configFilePath);
    const config = configModule.default as Config;
    return config || createDefaultConfig();
  } catch (error) {
    console.error('Failed to load configuration:', error);
    return createDefaultConfig();
  }
};
