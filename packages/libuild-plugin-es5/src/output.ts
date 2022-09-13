import type { LibuildPlugin } from '@modern-js/libuild';

export const es5OutputPlugin = (): LibuildPlugin => {
  const pluginName = 'libuild:babel-output-plugin';
  return {
    name: pluginName,
    apply(compiler) {
      compiler.hooks.initialize.tapPromise(pluginName, async () => {
        if (compiler.config.target === 'es5')
        compiler.config.target = 'esnext';
      });
      compiler.hooks.processAsset.tapPromise({ name: pluginName }, async (chunk) => {
        if (chunk.fileName.endsWith('.js') && chunk.type === 'chunk') {
          const result = await require('@babel/core').transformAsync(chunk.contents.toString(), {
            filename: chunk.fileName,
            presets: [
              [
                require('@babel/preset-env'),
                {
                  modules: false,
                },
              ],
            ],
            sourceType: 'module',
            sourceMaps: Boolean(compiler.config.sourceMap),
            inputSourceMap: false,
            compact: false,
            babelrc: false,
            configFile: false,
          });
          return {
            ...chunk,
            contents: result!.code!,
            map: result.map,
          };
        }
        return chunk;
      });
    },
  };
};
