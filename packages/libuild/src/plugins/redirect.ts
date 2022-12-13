/**
 * This plugin is used to redirectImport only in unbundle mode
 * Taking from https://github.com/ice-lab/icepkg/blob/main/packages/pkg/src/plugins/transform/alias.ts
 */
import { isAbsolute, resolve, relative, join, dirname, win32, basename, extname } from 'path';
import { init, parse } from 'es-module-lexer';
import type { ImportSpecifier } from 'es-module-lexer';
import { js } from '@ast-grep/napi';
import MagicString from 'magic-string';
import { resolvePathAndQuery } from '@modern-js/libuild-utils';
import { ILibuilder, LibuildPlugin } from '../types';
import { getAssetContents, assetExt } from './asset';
import { isCssModule } from './style/postcssTransformer';

function normalizeSlashes(file: string) {
  return file.split(win32.sep).join('/');
}

type MatchModule = {
  name?: string;
  start: number;
  end: number;
}[];

async function redirectImport(
  compiler: ILibuilder,
  code: string,
  modules: MatchModule,
  aliasRecord: Record<string, string>,
  filePath: string,
  outputDir: string
): Promise<MagicString> {
  const str: MagicString = new MagicString(code);

  await Promise.all(
    modules.map(async (module) => {
      const { name, start, end } = module;
      if (!name) {
        return;
      }

      // redirect asset path
      // import xxx from './xxx.svg';
      if (assetExt.filter((ext) => name.endsWith(ext)).length) {
        const absPath = resolve(dirname(filePath), name);
        const relativeImportPath = await getAssetContents.apply(compiler, [absPath, outputDir]);
        str.overwrite(start, end, `${relativeImportPath}`);
        return;
      }
      // redirect alias
      let absoluteImportPath = '';
      for (const alias of Object.keys(aliasRecord)) {
        // prefix
        if (name.startsWith(`${alias}/`)) {
          absoluteImportPath = join(aliasRecord[alias], name.slice(alias.length + 1));
          break;
        }
        // full path
        if (name === alias) {
          absoluteImportPath = aliasRecord[alias];
          break;
        }
      }

      if (absoluteImportPath) {
        const relativePath = relative(dirname(filePath), absoluteImportPath);
        const relativeImportPath = normalizeSlashes(relativePath.startsWith('..') ? relativePath : `./${relativePath}`);
        str.overwrite(start, end, relativeImportPath);
        return;
      }
      // redirect style path
      // css module
      const { originalFilePath, query } = resolvePathAndQuery(name);
      if (query.css_virtual) {
        const base = `${basename(originalFilePath, extname(originalFilePath))}.css`;
        const contents = compiler.virtualModule.get(originalFilePath)!;
        const fileName = join(outputDir, base);
        compiler.emitAsset(fileName, {
          type: 'asset',
          contents,
          fileName,
          originalFileName: originalFilePath,
          entryPoint: originalFilePath,
        });
        str.overwrite(start, end, `./${base}`);
      }
      // less sass
      const ext = extname(name);
      if (ext === '.less' || ext === '.sass' || ext === '.scss' || ext === '.css') {
        if (isCssModule(name!, compiler.config.style?.autoModules ?? true)) {
          str.overwrite(start, end, `${name.slice(0, -ext.length)}`);
        } else {
          str.overwrite(start, end, `${name.slice(0, -ext.length)}.css`);
        }
      }
    })
  );
  return str;
}

// base dir to redirect import path
export const redirectPlugin = (): LibuildPlugin => {
  const pluginName = 'libuild:redirect';
  return {
    name: pluginName,
    apply(compiler) {
      compiler.hooks.processAsset.tapPromise(pluginName, async (args) => {
        if (args.type === 'asset') return args;
        const { contents: code, fileName, entryPoint: id } = args;
        const {
          format,
          resolve: { alias },
        } = compiler.config;

        if (!code || format === 'iife' || format === 'umd') {
          return args;
        }

        // transform alias to absolute path
        const absoluteAlias = Object.entries(alias).reduce<typeof alias>((result, [name, target]) => {
          if (!isAbsolute(target)) {
            result[name] = resolve(compiler.config.root, target);
          } else {
            result[name] = target;
          }
          return result;
        }, {});

        let matchModule: MatchModule = [];
        if (format === 'esm') {
          await init;
          let imports: readonly ImportSpecifier[] = [];
          try {
            [imports] = parse(code);
          } catch (e) {
            console.error('[parse error]', e);
          }
          if (!imports.length) {
            return args;
          }
          matchModule = imports.map((targetImport) => {
            return {
              name: targetImport.n,
              start: targetImport.s,
              end: targetImport.e,
            };
          });
        }
        if (format === 'cjs') {
          const sgNode = js.parse(code).root();
          matchModule = sgNode.findAll('require($MATCH)').map((node) => {
            const matchNode = node.getMatch('MATCH')!;
            return {
              name: matchNode.text().slice(1, -1),
              start: matchNode.range().start.index + 1,
              end: matchNode.range().end.index - 1,
            };
          });
        }
        const str = await redirectImport(compiler, code, matchModule, absoluteAlias, id!, dirname(fileName));
        return {
          ...args,
          contents: str.toString(),
          map: str.generateMap({
            hires: true,
            includeContent: true,
          }),
        };
      });
    },
  };
};
