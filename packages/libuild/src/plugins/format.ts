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

          if (format === 'esm') {
            return {
              ...chunk,
              contents: code,
            };
          }

          if (format === 'cjs' || format === 'iife') {
            const result = await transform(code, {
              sourcemap: Boolean(compiler.config.sourceMap),
              target: compiler.config.target,
              format,
              charset: 'utf8',
            });
            return {
              ...chunk,
              contents: result.code,
              map: result.map ? JSON.parse(result.map) : undefined,
            };
          }

          const plugins = [];
          if (format === 'umd') {
            plugins.push(require('@babel/plugin-transform-modules-umd'));
          }
          const babel = (await import('@babel/core')).default;
          const result = await babel.transformAsync(chunk.contents.toString(), {
            filename: chunk.fileName,
            plugins,
            sourceType: 'module',
            sourceMaps: !!compiler.config.sourceMap,
            compact: false,
            babelrc: false,
            configFile: false,
          });
          return {
            ...chunk,
            contents: result!.code!,
            map: result!.map,
          };
        }
        return chunk;
      });
    },
  };
};
