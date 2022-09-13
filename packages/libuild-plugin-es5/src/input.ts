import type { LibuildPlugin } from '@modern-js/libuild';
import { isJsExt, isJsLoader, resolvePathAndQuery } from '@modern-js/libuild-utils';
import path from 'path';

export interface InputPluginOptions {
  /**
   * polyfill core-js
   */
  polyfill?: boolean;
}

export const es5InputPlugin = ({ polyfill }: InputPluginOptions = {}): LibuildPlugin => {
  const pluginName = 'libuild:babel-input-plugin';
  return {
    name: pluginName,
    apply(compiler) {
      compiler.hooks.initialize.tapPromise(pluginName, async () => {
        compiler.config.target = 'es5';
      });
      compiler.hooks.transform.tapPromise({ name: pluginName, stage: 253 }, async (args) => {
        const filename = resolvePathAndQuery(args.path).originalFilePath;
        if (isJsExt(filename) || isJsLoader(args.loader)) {
          const plugins = [];
          const presets = [];
          if (polyfill) {
            plugins.push([
              require('@babel/plugin-transform-runtime'),
              {
                corejs: false,
                regenerator: false,
                helpers: true,
                absoluteRuntime: path.dirname(require.resolve('@babel/runtime/package.json', { paths: [__dirname] })),
              },
            ]);
            plugins.push([
              require('babel-plugin-polyfill-corejs3'),
              {
                method: 'usage-global',
                absoluteImports: path.dirname(require.resolve('core-js/package.json', { paths: [__dirname] })),
                targets: {
                  ios: 9,
                  android: 4,
                },
              },
            ]);
          }
          plugins.push([
            require('babel-plugin-polyfill-regenerator'),
            {
              method: 'usage-global',
              absoluteImports: path.dirname(
                require.resolve('regenerator-runtime/package.json', { paths: [__dirname] })
              ),
            },
          ]);

          if (/.(jsx|tsx)$/.test(filename) || args.loader === 'tsx' || args.loader === 'jsx') {
            presets.push([require('@babel/preset-react')]);
          }
          if (/.(ts|tsx)$/.test(filename) || args.loader === 'ts' || args.loader === 'tsx') {
            presets.push([require('@babel/preset-typescript')]);
          }
          const result = await require('@babel/core').transformAsync(args.code, {
            filename,
            exclude: [/\bcore-js\b/, /\bregenerator-runtime\b/],
            presets: [
              [
                require('@babel/preset-env'),
                {
                  modules: false,
                },
              ],
              ...presets,
            ],
            plugins,
            sourceType: 'module',
            sourceFileName: filename,
            inputSourceMap: false,
            sourceMaps: Boolean(compiler.config.sourceMap),
            compact: false,
            babelrc: false,
            configFile: false,
          });
          return {
            ...args,
            code: result?.code!,
            map: result?.map,
          };
        }
        return args;
      });
    },
  };
};
