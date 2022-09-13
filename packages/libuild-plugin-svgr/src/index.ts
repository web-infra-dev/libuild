import fs from 'fs';
import path from 'path';
import { transform, Config } from '@svgr/core';
import { createFilter, CreateFilter } from 'rollup-pluginutils';
import svgo from '@svgr/plugin-svgo';
import jsx from '@svgr/plugin-jsx';
import type { LibuildPlugin } from '@modern-js/libuild';

export interface Options extends Config {
  include?: Parameters<CreateFilter>[0];
  exclude?: Parameters<CreateFilter>[1];
}

const PLUGIN_NAME = 'libuild:svgr';
const SVG_REGEXP = /\.svg$/;

const EXPORT_REGEX = /(module\.exports *= *|export default)/;
export const svgrPlugin = (options: Options = {}): LibuildPlugin => {
  const filter = createFilter(options.include || SVG_REGEXP, options.exclude);
  return {
    name: PLUGIN_NAME,
    apply(compiler) {
      compiler.hooks.transform.tapPromise(PLUGIN_NAME, async (args) => {
        const basename = path.basename(args.path);
        const code = `./${basename}`;
        if (!filter(args.path)) return args;
        const loader = 'jsx';
        const text = fs.readFileSync(args.path.split('?')[0], 'utf8');
        const previousExport = EXPORT_REGEX.test(code) ? code : `export default "${code}"`;
        const jsCode = await transform(text, options, {
          filePath: args.path,
          caller: {
            name: PLUGIN_NAME,
            previousExport,
            defaultPlugins: [svgo, jsx],
          },
        });
        return {
          code: jsCode,
          path: args.path,
          loader,
        };
      });
    },
  };
};
