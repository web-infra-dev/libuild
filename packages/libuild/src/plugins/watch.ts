import type { Stats } from 'fs';
import chokidar, { FSWatcher } from 'chokidar';
import chalk from 'chalk';
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
         * do nothing currently
         */
        const handleAdd = () => {};
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
