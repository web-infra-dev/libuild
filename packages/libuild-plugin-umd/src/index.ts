import type { LibuildPlugin } from '@modern-js/libuild';
import { transform } from '@swc/core';

type Options = {
  moduleName?: string | ((chunkName: string) => string);
};

export const umdPlugin = (options?: Options): LibuildPlugin => {
  const pluginName = 'libuild:umd';
  return {
    name: pluginName,
    apply(compiler) {
      compiler.hooks.processAsset.tapPromise({ name: pluginName }, async (chunk) => {
        if (chunk.fileName.endsWith('.js') && chunk.type === 'chunk') {
          const moduleName = options?.moduleName ?? chunk.fileName;
          const filename = typeof moduleName === 'function' ? moduleName(chunk.fileName) : moduleName;
          const result = await transform(chunk.contents.toString(), {
            filename,
            sourceMaps: Boolean(compiler.config.sourceMap),
            inputSourceMap: false,
            swcrc: false,
            configFile: false,
            jsc: {
              target: 'es2022',
            },
            module: {
              type: 'umd',
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
