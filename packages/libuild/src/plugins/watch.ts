import type { Stats } from 'fs';
import chokidar, { FSWatcher } from 'chokidar';
import path from 'path';
import micromatch from 'micromatch';
import globParent from 'glob-parent';
import { LibuildPlugin } from '../types';

export const watchPlugin = (): LibuildPlugin => {
  const pluginName = 'libuild:watch';
  let watch: FSWatcher;
  return {
    name: pluginName,
    apply(compiler) {
      compiler.hooks.initialize.tap(pluginName, () => {
        watch = chokidar.watch([compiler.config.root], {
          useFsEvents: false, // disable fsevents due to fsevents hoist problem
          ignored: ['node_modules', '.gitignore', '.git', compiler.config.outdir],
          cwd: compiler.config.root,
        });
        compiler.watcher = watch as FSWatcher;
        let running = false;
        let needReRun = false;
        const addedPaths: string[] = [];
        /**
         * Only can rebuild when bundle is false
         */
        const handleAdd = async (filePath: string) => {
          const { input: userInput } = compiler.userConfig;
          const { bundle, root, input } = compiler.config;
          const absFilePath = path.resolve(root, filePath);
          let shouldRebuild = false;
          if (Array.isArray(userInput) && !bundle) {
            userInput.forEach(async (i) => {
              const absGlob = path.resolve(root, i);
              if (absGlob !== globParent(absGlob)) {
                micromatch.isMatch(absFilePath, absGlob) && (shouldRebuild = true);
              } else if (absFilePath.startsWith(absGlob)) {
                shouldRebuild = true;
              }
            });
            if (shouldRebuild) {
              if (running) {
                needReRun = true;
                addedPaths.push(filePath);
              } else {
                running = true;
                (input as string[]).push(filePath);
                await compiler.compilation.reBuild([filePath], 'add');
                running = false;
                if (needReRun) {
                  needReRun = false;
                  await compiler.compilation.reBuild([...new Set(addedPaths.splice(0, addedPaths.length))], 'change');
                }
              }
            }
          }
        };
        /**
         * do nothing currently
         */
        const handleUnlink = () => {};

        const handleChange = async (filePath: string, events: Stats, ...args: any[]) => {
          const paths = [filePath];
          if (compiler.compilation.shouldRebuild(paths)) {
            await compiler.compilation.reBuild(paths, 'change');
          }
        };
        watch.on('ready', () => {
          watch.on('change', handleChange);
          watch.on('add', handleAdd);
          watch.on('unlink', handleUnlink);
        });
        watch.once('restart', () => {
          watch.removeListener('change', handleChange);
        });
      });
      compiler.hooks.shutdown.tapPromise('watch', async () => {
        await watch.close();
      });
    },
  };
};
