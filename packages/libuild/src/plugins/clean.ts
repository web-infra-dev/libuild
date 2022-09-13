import rimraf from 'rimraf';
import { LibuildPlugin } from '../types';

export const cleanPlugin = (): LibuildPlugin => {
  return {
    name: 'clean',
    apply(compiler) {
      compiler.hooks.initialize.tap('clean', () => {
        rimraf.sync(compiler.config.outdir);
      });
    },
  };
};
