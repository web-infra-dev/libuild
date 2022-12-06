import { transform } from 'esbuild';
import { BuildConfig, LibuildPlugin } from '../types';

export const formatPlugin = (): LibuildPlugin => {
  const pluginName = 'libuild:format';
  const getFormatForChunk = (format: BuildConfig['format'], chunkName: string) => {
    if (typeof format === 'function') {
      return format(chunkName);
    }
    return format;
  };
  return {
    name: pluginName,
    apply(compiler) {
      compiler.hooks.processAsset.tapPromise({ name: pluginName }, async (chunk) => {
        if (chunk.fileName.endsWith('.js') && chunk.type === 'chunk') {
          const format = getFormatForChunk(compiler.config.format, chunk.originalFileName || chunk.fileName);
          const code = chunk.contents.toString();
          const { sourceMap, target } = compiler.config;

          if (format === 'cjs' || format === 'iife') {
            const result = await transform(code, {
              sourcemap: Boolean(sourceMap),
              target,
              format,
              charset: 'utf8',
            });
            return {
              ...chunk,
              contents: result.code,
              map: result.map ? JSON.parse(result.map) : undefined,
            };
          }
        }
        return chunk;
      });
    },
  };
};
