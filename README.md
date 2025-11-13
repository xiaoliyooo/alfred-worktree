# Alfred Worktree

[中文版](./README_zh.md) | English

# Background

**Git worktree** is an advanced Git feature. During development, when you need to constantly switch branches, instead of repeatedly using `stash`, it's better to check out different worktrees for different branches. Switching services between different branches (worktrees) can be troublesome. By creating workflows, you can automate this behavior and also manage the service status of different projects.

# Features

1. This workflow is used to quickly manage multiple frontend project services. I use it daily to manage multiple **git worktrees**, reducing repetitive work
2. Supports simultaneous management of multiple projects on **different ports**
3. Supports service switching between **git worktrees**
4. Supports one-click shutdown of **all services**, or selective shutdown of **individual services**
5. Service mutual exclusion between projects on the same port
6. Configurable

# Examples

1. `ss` Manage development services

![](./images/example1.png)

2. `sc` Open configuration file

![](./images/example2.png)

# Usage

1. Two installation methods
   - `npm i -g alfred-worktree`
   - Download the latest **release** from the repository and double-click to install **worktree.alfredworkflow**
2. Call through **Alfred** search box by entering keyword **ss**. First use will initialize configuration in `~/alfred-worktree/worktree.config.js`
3. Selecting **Stop All** will pause all frontend services. Selecting a service will stop other **port-conflicting** services and **restart** the selected service
4. Hold `Ctrl` while selecting a service to only stop without restarting

# Configuration

## Configuration File Structure

The configuration file is located at `~/alfred-worktree/worktree.config.js` and uses ES Module format.

### Basic Configuration Example

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
      return `Worktree is running [${branch}] branch`;
    },
  },
  opener: "", // Optional values: 'vscode' | 'code' | 'cursor' | 'codebuddy' |'buddy' | ''
};
```

## Configuration Parameters

### Project Configuration

Each project configuration object contains the following fields:

| Parameter | Type       | Required | Description                                                                    |
| --------- | ---------- | -------- | ------------------------------------------------------------------------------ |
| `name`    | `string`   | ✅       | Project display name, used to identify the project in Alfred interface        |
| `root`    | `string`   | ✅       | Git main worktree path (equals project Git path if no worktree), absolute path |
| `cmd`     | `string`   | ✅       | Command to start the project, such as `pnpm run dev`, `npm start`, etc.       |
| `port`    | `string`   | ✅       | Project startup port number, used for port mutual exclusion management        |
| `cmdPath` | `function` | ❌       | Optional function to specify command execution path, mainly for Monorepo projects |

#### cmdPath Function Details

```ts
cmdPath?: (worktreeRoot: string) => string
```

- **Parameter**: `worktreeRoot` - Git worktree root path, or project root path if no worktree exists
- **Return value**: Specific path for command execution
- **Use cases**:
  - Monorepo projects need to enter sub-package directory to execute commands
  - Non-Monorepo projects can skip this field or directly return `worktreeRoot`

### Style Configuration

Used to customize Alfred menu interface display style:

| Parameter           | Type       | Required | Description                      |
| ------------------- | ---------- | -------- | -------------------------------- |
| `titleFormatter`    | `function` | ❌       | Custom title display format      |
| `subTitleFormatter` | `function` | ❌       | Custom subtitle display format   |

#### Formatter Function Details

```ts
titleFormatter?: (project: Project, worktree: Worktree) => string
subTitleFormatter?: (project: Project, worktree: Worktree) => string
```

- **Parameters**:
  - `project` - Current project configuration object
  - `worktree` - Current worktree information object
- **Return value**: Formatted display text

### Opener Configuration

Used to customize how configuration files are opened:

- `opener`: `'vscode' | 'code' | 'cursor' | 'buddy' | 'codebuddy' | ''`, optional value. Unsupported content or no value will use default text editor

## Type Definitions

### Project Interface

```ts
export interface Project {
  name: string; // Project name
  root: string; // Git main worktree path (equals project Git path if no worktree), absolute path
  cmd: string; // Startup command
  port: string; // Port number
  cmdPath?: (rootPath: string) => string; // Optional command execution path function
}
```

### Worktree Type

```ts
export type Worktree = {
  root: string; // Worktree root path
  HEAD: string; // git HEAD hash value
  branch: string; // Current branch name
  isRunning: boolean; // Whether it's running
};
```

## Configuration Examples

### Monorepo Project Configuration

```js
{
  name: "Frontend Monorepo - Admin",
  root: "/Users/username/projects/my-monorepo",
  cmd: "pnpm run dev",
  port: "3000",
  cmdPath(worktreeRoot) {
    // Enter admin sub-package directory to execute
    return `${worktreeRoot}/packages/admin`;
  },
}
```

### Regular Project Configuration

```js
{
  name: "My Vue Project",
  root: "/Users/username/projects/vue-app",
  cmd: "npm run serve",
  port: "8080",
  // Regular projects don't need cmdPath configuration
}
```

### Custom Style Configuration

```js
style: {
    titleFormatter(project, worktree) {
      const { isRunning } = worktree;
      return `${isRunning ? `🟢` : ""}[${project.name}] -> ${project.cmd}`;
    },
    subTitleFormatter(project, worktree) {
      const { branch } = worktree;
      return `Worktree is running [${branch}] branch`;
    },
}
```

# Notes

1. For **Monorepo** projects, if sub-packages and root path **share** build tool npm dependencies, currently only **Vite** projects are adapted. **Non-Monorepo** projects are not affected
2. Computer Node version should support native **ESM** syntax (embracing future trends)

# Todo

1. - [ ] Add log output
2. - [x] Modify configuration method
3. - [x] Support different projects running services simultaneously