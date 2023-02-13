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
        const batchedPaths: string[] = [];
        const handleBatchChange = async (paths: string[]) => {
          if (!compiler.compilation.canRebuild()) {
            needReRun = true;
            batchedPaths.push(...paths);
          } else if (running) {
            needReRun = true;
            batchedPaths.push(...paths);
          } else if (compiler.compilation.shouldRebuild(paths)) {
            running = true;
            compiler.hooks.watchChange.call(paths);
            await compiler.compilation.reBuild(paths);
            running = false;
            if (needReRun) {
              needReRun = false;
              handleBatchChange([...new Set(batchedPaths.splice(0, batchedPaths.length))]);
            }
          }
        };
        /**
         * Only can rebuild when bundle is false
         */
        const handleAdd = (filePath: string) => {
          const { input: userInput } = compiler.userConfig;
          const { bundle, root, input } = compiler.config;
          const absFilePath = path.resolve(root, filePath);
          if (Array.isArray(userInput) && !bundle) {
            userInput.forEach((i) => {
              const absGlob = path.resolve(root, i);
              let shouldRebuild = false;
              if (absGlob !== globParent(absGlob)) {
                micromatch.isMatch(absFilePath, absGlob) && (shouldRebuild = true);
              } else if (absFilePath.startsWith(absGlob)) {
                shouldRebuild = true;
              }
              if (shouldRebuild) {
                (input as string[]).push(absFilePath);
                compiler.addWatchFile(absFilePath);
                handleBatchChange([filePath]);
              }
            });
          }
        };
        /**
         * do nothing currently
         */
        const handleUnlink = () => {};

        function handleChange(filePath: string, events: Stats, ...args: any[]) {
          handleBatchChange([filePath]);
        }
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
