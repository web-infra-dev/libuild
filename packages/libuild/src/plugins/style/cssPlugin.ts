import { resolvePathAndQuery, isStyleExt } from '@modern-js/libuild-utils';
import { readFileSync } from 'fs';
import { Source, LibuildPlugin } from '../../types';
import { getHash } from './utils';
import { transformStyle } from './transformStyle';

export const cssPlugin = (): LibuildPlugin => {
  const cssVirtual = 'css_virtual';
  const pluginName = 'libuild:css';
  return {
    name: pluginName,
    apply(compiler) {
      const moduleCache: Record<string, string> = {};
      compiler.hooks.load.tapPromise(pluginName, async (args) => {
        if (isStyleExt(args.path)) {
          const { originalFilePath, query } = resolvePathAndQuery(args.path);
          if (query.css_virtual) {
            return {
              contents: moduleCache[originalFilePath],
              loader: 'css',
            };
          }
          return {
            contents: readFileSync(args.path),
            loader: 'css',
          };
        }
      });
      compiler.hooks.transform.tapPromise(pluginName, async (source): Promise<Source> => {
        if (isStyleExt(source.path)) {
          const { query } = resolvePathAndQuery(source.path);
          if (query[cssVirtual]) {
            return {
              code: source.code,
              loader: 'css',
              path: source.path,
            };
          }
          const { contents, modules } = await transformStyle.apply(compiler, [source]);
          if (Object.values(modules).length) {
            // add hash query for same path, let esbuild cache invalid
            const code = `
import "${source.path}?css_virtual&hash=${getHash(contents, 'utf-8')}";
export default ${JSON.stringify(modules)}`;
            moduleCache[source.path] = contents;
            return {
              ...source,
              code,
              loader: 'js',
            };
          }

          return {
            ...source,
            code: contents,
            loader: 'css',
          };
        }
        return source;
      });
    },
  };
};
