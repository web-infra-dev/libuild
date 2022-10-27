import { formatPlugin } from './format';
import { resolvePlugin } from './resolve';
import { writeFilePlugin } from './write-file';
import { cssPlugin, minifyCssPlugin } from './style';
import { minifyPlugin } from './minify';
import { assetsPlugin } from './asset';

import { BuildConfig, ILibuilder } from '../types';

export async function pluginApply(config: BuildConfig, compiler: ILibuilder) {
  if (config.clean) {
    const { cleanPlugin } = await import('./clean');
    cleanPlugin().apply(compiler);
  }

  if (config.watch) {
    const { watchPlugin } = await import('./watch');
    watchPlugin().apply(compiler);
  }

  resolvePlugin().apply(compiler);

  assetsPlugin().apply(compiler);
  cssPlugin().apply(compiler);

  if (!config.bundle) {
    const { redirectPlugin } = await import('./redirect');

    redirectPlugin().apply(compiler);
  }
  minifyPlugin().apply(compiler);

  formatPlugin().apply(compiler);

  minifyCssPlugin().apply(compiler);

  writeFilePlugin().apply(compiler);
  if (config.metafile) {
    const { metaFilePlugin } = await import('./metafile');

    metaFilePlugin().apply(compiler);
  }
}
