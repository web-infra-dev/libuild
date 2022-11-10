import { formatPlugin } from './format';
import { resolvePlugin } from './resolve';
import { writeFilePlugin } from './write-file';
import { cssPlugin, minifyCssPlugin } from './style';
import { minifyPlugin } from './minify';
import { assetsPlugin } from './asset';

import { BuildConfig } from '../types';

export async function getInternalPlugin(config: BuildConfig) {
  const internalPlugin = [];
  if (config.clean) {
    const { cleanPlugin } = await import('./clean');
    internalPlugin.push(cleanPlugin());
  }

  if (config.watch) {
    const { watchPlugin } = await import('./watch');
    internalPlugin.push(watchPlugin());
  }

  internalPlugin.push(resolvePlugin(), assetsPlugin(), cssPlugin());

  if (!config.bundle) {
    const { redirectPlugin } = await import('./redirect');
    internalPlugin.push(redirectPlugin());
  }

  internalPlugin.push(formatPlugin(), minifyCssPlugin(), writeFilePlugin());

  if (config.metafile) {
    const { metaFilePlugin } = await import('./metafile');
    internalPlugin.push(metaFilePlugin());
  }

  return internalPlugin;
}