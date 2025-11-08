# 作用

1. 此工作流用于快速切换多个项目前端服务
2. 支持多个不同端口的不同项目同时管理
3. 支持**git**工作树服务切换
4. 支持一键关闭全部服务，或者选择关闭单个服务
5. 同端口项目之间服务互斥
6. 可配置化

# 使用

1. 下载仓库，双击安装worktree.alfredworkflow
2. 通过**Alfred**搜索框输入关键字**ss**调用，首次使用会在 `~/alfred-worktree/worktree.config.js` 中初始化配置
3. 以下为目前全部支持字段：

   ```js
   export default {
     projects: [
       {
         name: "Monorepo Project Sub-Package1", // 假设这是一个monorepo项目的一个子包
         root: "/a/b/c", // 配置项目 git 根路径
         cmd: "pnpm run https:test", // 根据你的需要改成启动你的项目的命令
         port: "443", // 你的项目启动端口号
         cmdPath(worktreeRoot) {
           // 参数为git工作树根路径, 无工作树则项目根路径(默认主工作树)
           // 如果是monorepo项目可能会进入子包执行具体子包的命令，需要返回子包package.json路径
           // 非monorepo不需要配置 cmdPath 字段或者直接返回 worktreeRoot
           return `${worktreeRoot}/packages/sub1`;
         },
       },
       {
         name: "Monorepo Project Sub-Package2", // 和上一条配置同属一个git，但是不同子包
         root: "/a/b/c",
         cmd: "pnpm run https:test",
         port: "443",
         cmdPath(worktreeRoot) {
           return `${worktreeRoot}/packages/sub2`;
         },
       },
       {
         name: "Project2", // 非monorepo项目
         root: "/x/y/z",
         cmd: "pnpm run dev",
         port: "5173",
       },
     ],
   };
   ```

# Todo

1. - [ ] 增加日志输出
2. - [x] 修改配置方式
3. - [x] 支持不同项目同时运行服务
