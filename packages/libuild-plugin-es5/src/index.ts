import type { LibuildPlugin } from '@modern-js/libuild';
import { transform } from '@swc/core';

export const es5Plugin = (): LibuildPlugin => {
  const pluginName = 'libuild:es5';
  return {
    name: pluginName,
    apply(compiler) {
      compiler.hooks.initialize.tapPromise(pluginName, async () => {
        compiler.config.target = 'esnext';
      });
      compiler.hooks.processAsset.tapPromise({ name: pluginName }, async (chunk) => {
        if (chunk.fileName.endsWith('.js') && chunk.type === 'chunk') {
          const result = await transform(chunk.contents.toString(), {
            filename: chunk.fileName,
            sourceMaps: Boolean(compiler.config.sourceMap),
            inputSourceMap: false,
            swcrc: false,
            configFile: false,
            jsc: {
              target: 'es5',
              parser: {
                syntax: 'ecmascript',
              },
            },
          });
          return {
            ...chunk,
            contents: result.code,
            map: typeof result.map === 'string' ? JSON.parse(result.map) : result.map,
          };
        }
        return chunk;
      });
    },
  };
};
