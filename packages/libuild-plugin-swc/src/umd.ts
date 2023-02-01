import type { LibuildPlugin } from '@modern-js/libuild';
import { Compiler } from '@modern-js/swc-plugins';

export const umdPlugin = (filename?: string | ((filename: string) => string)): LibuildPlugin => {
  const pluginName = 'libuild:swc-umd';
  return {
    name: pluginName,
    apply(compiler) {
      compiler.hooks.processAsset.tapPromise({ name: pluginName }, async (chunk) => {
        if (chunk.fileName.endsWith('.js') && chunk.type === 'chunk') {
          const name = typeof filename === 'function' ? filename(chunk.fileName) : filename ?? chunk.fileName;
          const swcCompiler = new Compiler({
            filename: name,
            sourceMaps: Boolean(compiler.config.sourceMap),
            inputSourceMap: false,
            swcrc: false,
            configFile: false,
            extensions: {},
            jsc: { target: 'es2022' },
            module: {
              type: 'umd',
            },
            isModule: 'unknown',
          });
          const result = await swcCompiler.transformSync(name, chunk.contents.toString());
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
