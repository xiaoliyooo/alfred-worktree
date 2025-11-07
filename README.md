# 作用

1. 这个Alfred工作流用于快速切换一个项目中多个git worktree时开发服务切换问题
2. 选择stop会暂停全部前端服务
3. 选择任意一个前端服务会暂停其他前端服务，重启选择服务

# 使用

1. 下载仓库，双击安装worktree.alfredworkflow
2. 打开Alfred找到工作流右键通过文件夹打开
	![](./images/Pasted%20image%2020251107140731.png)
3. 打开dist路径下的**worktree.config.js**文件配置管理的项目信息
	![](./images/Pasted%20image%2020251107143129.png)
4. 配置字段方式如下：
	```js
	export default {
		projects: [
			{
				name: 'Project1 Sub Package1',  // 不同git项目，也可以配置一个项目的多个子包
				root: '/a/b/c', // 用于查找git工作树，配置项目git根路径
				cmd: 'pnpm run dev', // 根据你的需要改成启动你的项目的命令
				cmdPath(worktreeRoot) {
					// 回调参数为git工作树根路径
					// 如果是monorepo项目可能会进入子包执行具体子包的命令，需要配置子包package.json路径
					// 非monorepo不需要配置 cmdPath 字段或者直接返回 worktreeRoot
					return `${worktreeRoot}/packages/sub1`;
				},
				checkRunningPath(worktreeRoot) {
					// 当前子包不复用项目根路径的构建工具
					return `${worktreeRoot}/packages/annotation`;
				},
				/**
				* stat结构
				* pid: number;
				* ppid: number;
				* uid: number;
				* gid: number;
				* name: string;
				* cmd: string; 执行前端服务的命令 可以通过 ps aux | grep vite 在本机查看(以vite为例)
				*/
				isProjectProcess(stat) {
					const { name, cmd } = stat;
					// 根据进程命令配置一个可以精确匹配当前服务进程名的逻辑
					return name === 'node' && cmd.includes('vite.js --mode test --host');
				},
			},
			{
				name: 'Project1 Sub Package2', // 和上一条配置同属一个git，但是不同子包
				root: '/a/b/c',
				cmd: 'pnpm run https:test',
				cmdPath(worktreeRoot) {
					return `${worktreeRoot}/packages/sub2`;
				},
				checkRunningPath(worktreeRoot) {
					// 当前子包复用项目根路径的构建工具
					return `${worktreeRoot}`;
				},
				isProjectProcess(stat) {
					const { name, cmd } = stat;
					return (name === 'node' &&
						cmd.includes('vite.js --mode test') &&
						!cmd.includes('packages/xxx/node_modules'));
				},
			},
		],
	};
	```
 
 # Todo
 
 1. 增加输出信息
 2. 修改配置方式
 3. 支持不同项目同时运行服务
