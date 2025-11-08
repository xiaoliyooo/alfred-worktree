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
    //   cmdPath: (worktreeRoot) => worktreeRoot,
    // }
  ]
};
`;
};

export const createDefaultConfig = (): Config => {
  return {
    projects: [],
  };
};
