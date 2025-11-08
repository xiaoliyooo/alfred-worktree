import alfy, { ScriptFilterItem } from 'alfy';
import { noop, getCombinedContextList } from './utils.js';
import {
  titleFormatter as defaultTitleFormatter,
  subTitleFormatter as defaultSubTitleFormatter,
} from './formatter.js';
import { exec as _exec } from 'child_process';

async function display() {
  const alfredList: ScriptFilterItem[] = [];
  const ctxList = await getCombinedContextList();

  ctxList.forEach(ctx => {
    const { project, worktrees, style } = ctx;
    const { cmdPath = noop } = project;
    const { titleFormatter = defaultTitleFormatter, subTitleFormatter = defaultSubTitleFormatter } =
      style;

    worktrees.forEach(worktree => {
      const { isRunning, branch, root } = worktree;
      alfredList.push({
        title: titleFormatter(project, worktree),
        subtitle: subTitleFormatter(project, worktree),
        arg: JSON.stringify({
          branch,
          root,
          isRunning,
          cmdPath: cmdPath(root),
          name: project.name,
        }),
      });
    });
  });

  alfy.output(alfredList);
}

await display();
