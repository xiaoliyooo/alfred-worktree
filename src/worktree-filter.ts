import alfy, { ScriptFilterItem } from 'alfy';
import { noop, getAllProjectsWithWorkTree } from './utils.js';
import {
  titleFormatter as defaultTitleFormatter,
  subTitleFormatter as defaultSubTitleFormatter,
} from './formatter.js';
import { exec as _exec } from 'child_process';

async function display() {
  const alfredList: ScriptFilterItem[] = [];
  const allProjectsWithWorkTree = await getAllProjectsWithWorkTree();

  allProjectsWithWorkTree.forEach(project => {
    const { worktree, cmdPath = noop, style } = project;
    const { titleFormatter = defaultTitleFormatter, subTitleFormatter = defaultSubTitleFormatter } =
      style;

    worktree.forEach(workspace => {
      const { isRunning, branch, root } = workspace;
      alfredList.push({
        title: titleFormatter(project, workspace),
        subtitle: subTitleFormatter(project, workspace),
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
