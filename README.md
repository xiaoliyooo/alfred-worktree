# 背景

**git worktree**是git的高级功能，实际开发时如果需要不断切换分支，比起不断 `stash` 代码，更好的是为不同分支迁出不同工作树（worktree），不同分支（工作树）之间服务切换是个麻烦的问题，通过编写工作流可以自动化这个行为，同时也可以管理不同项目的服务状态。

# 功能

1. 此工作流用于快速管理多个前端项目服务，我自己每天工作都在使用它管理多个**git工作树**，减少重复劳动
2. 支持多个**不同端口**的不同项目同时管理
3. 支持**git工作树**之间服务切换
4. 支持一键关闭**全部服务**，或者选择关闭**单个服务**
5. 同端口项目之间服务互斥
6. 可配置化

# 示例

1. `ss` 管理开发服务

![](./images/example1.png)

2. `sc` 打开配置文件

![](./images/example2.png)

# 使用

1. 两种安装方式
   - `npm i -g alfred-worktree`
   - 下载仓库最新**release**，双击安装**worktree.alfredworkflow**
2. 通过**Alfred**搜索框输入关键字**ss**调用，首次使用会在 `~/alfred-worktree/worktree.config.js` 中初始化配置
3. 选择**Stop All**会暂停全部前端服务，选择一个服务会停止其他**端口互斥**的服务并**重启**选择的服务
4. 按住 `Ctrl` 选择服务只关闭不重启

# 配置说明

## 配置文件结构

配置文件位于 `~/alfred-worktree/worktree.config.js`，采用 ES Module 格式。

### 基本配置示例

```js
export default {
  projects: [
    {
      name: "Monorepo Project Sub-Package1",
      root: "/a/b/c",
      cmd: "pnpm run https:test",
      port: "443",
      cmdPath(worktreeRoot) {
        return `${worktreeRoot}/packages/sub1`;
      },
    },
    {
      name: "Project2",
      root: "/x/y/z",
      cmd: "pnpm run dev",
      port: "5173",
    },
  ],
  style: {
    titleFormatter(project, worktree) {
      const { isRunning } = worktree;
      return `${isRunning ? `🟢` : ""}[${project.name}] -> ${project.cmd}`;
    },
    subTitleFormatter(project, worktree) {
      const { branch } = worktree;
      return `工作树正在运行 [${branch}] 分支`;
    },
  },
  opener: "", // 可选值：'vscode' | 'code' | 'cursor' | 'codebuddy' |'buddy' | ''
};
```

## 配置参数详解

### Project 配置

每个项目配置对象包含以下字段：

| 参数      | 类型       | 必填 | 说明                                                       |
| --------- | ---------- | ---- | ---------------------------------------------------------- |
| `name`    | `string`   | ✅   | 项目显示名称，用于在 Alfred 界面中标识项目                 |
| `root`    | `string`   | ✅   | Git主工作树路径，（没创建工作树等于项目Git路径），绝对路径 |
| `cmd`     | `string`   | ✅   | 启动项目的命令，如 `pnpm run dev`、`npm start` 等          |
| `port`    | `string`   | ✅   | 项目启动的端口号，用于端口互斥管理                         |
| `cmdPath` | `function` | ❌   | 可选函数，用于指定命令执行路径，主要用于 Monorepo 项目     |

#### cmdPath 函数详解

```ts
cmdPath?: (worktreeRoot: string) => string
```

- **参数**: `worktreeRoot` - Git 工作树根路径，如果没有工作树则为项目根路径
- **返回值**: 命令执行的具体路径
- **使用场景**:
  - Monorepo 项目需要进入子包目录执行命令
  - 非 Monorepo 项目可以不配置此字段或直接返回 `worktreeRoot`

### Style 配置

用于自定义 Alfred 菜单界面显示样式：

| 参数                | 类型       | 必填 | 说明                 |
| ------------------- | ---------- | ---- | -------------------- |
| `titleFormatter`    | `function` | ❌   | 自定义标题显示格式   |
| `subTitleFormatter` | `function` | ❌   | 自定义副标题显示格式 |

#### 格式化函数详解

```ts
titleFormatter?: (project: Project, worktree: Worktree) => string
subTitleFormatter?: (project: Project, worktree: Worktree) => string
```

- **参数**:
  - `project` - 当前项目配置对象
  - `worktree` - 当前工作树信息对象
- **返回值**: 格式化后的显示文本

### Opener 配置

用于自定义打开配置文件方式：

- `opener`: `'vscode' | 'code' | 'cursor' | 'buddy' | 'codebuddy' | ''`，可选值，传入不支持的内容或不传递使用默认文本编辑器打开

## 类型定义

### Project 接口

```ts
export interface Project {
  name: string; // 项目名称
  root: string; // Git主工作树路径，（没创建工作树等于项目Git路径），绝对路径
  cmd: string; // 启动命令
  port: string; // 端口号
  cmdPath?: (rootPath: string) => string; // 可选的命令执行路径函数
}
```

### Worktree 类型

```ts
export type Worktree = {
  root: string; // 工作树根路径
  HEAD: string; // git HEAD hash值
  branch: string; // 当前分支名
  isRunning: boolean; // 是否正在运行
};
```

## 配置示例

### Monorepo 项目配置

```js
{
  name: "Frontend Monorepo - Admin",
  root: "/Users/username/projects/my-monorepo",
  cmd: "pnpm run dev",
  port: "3000",
  cmdPath(worktreeRoot) {
    // 进入 admin 子包目录执行
    return `${worktreeRoot}/packages/admin`;
  },
}
```

### 普通项目配置

```js
{
  name: "My Vue Project",
  root: "/Users/username/projects/vue-app",
  cmd: "npm run serve",
  port: "8080",
  // 普通项目无需配置 cmdPath
}
```

### 自定义样式配置

```js
style: {
    titleFormatter(project, worktree) {
      const { isRunning } = worktree;
      return `${isRunning ? `🟢` : ""}[${project.name}] -> ${project.cmd}`;
    },
    subTitleFormatter(project, worktree) {
      const { branch } = worktree;
      return `工作树正在运行 [${branch}] 分支`;
    },
}
```

# 注意

1. 对于**Monorepo**项目，如果子包和根路径**共享**构建工具npm依赖，目前只适配了**Vite**项目，**非Monorepo**无所谓
2. 电脑Node版本支持原生**ESM**语法（拥抱未来趋势）

# Todo

1. - [ ] 增加日志输出
2. - [x] 修改配置方式
3. - [x] 支持不同项目同时运行服务
