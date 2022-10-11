/**
 * This plugin is used to redirectImport only in unbundle mode
 * Taking from https://github.com/ice-lab/icepkg/blob/main/packages/pkg/src/plugins/transform/alias.ts
 */
import { isAbsolute, resolve, relative, join, dirname, win32 } from 'path';
import { createFilter } from '@rollup/pluginutils';
import { init, parse } from 'es-module-lexer';
import type { ImportSpecifier } from 'es-module-lexer';
import MagicString from 'magic-string';
import { ILibuilder, LibuildPlugin } from '../types';
import { getAssetContents } from './asset';

function normalizeSlashes(file: string) {
  return file.split(win32.sep).join('/');
}

const scriptsFilter = createFilter(
  /\.m?[jt]sx?$/, // include
  [/node_modules/, /\.d\.ts$/] // exclude
);

async function redirectImport(
  compiler: ILibuilder,
  code: string,
  imports: readonly ImportSpecifier[],
  aliasRecord: Record<string, string>,
  filePath: string,
  outputPath: string
): Promise<MagicString> {
  const str: MagicString = new MagicString(code);

  await Promise.all(
    imports.map(async (targetImport) => {
      // redirect asset path
      // import xxx from './xxx.svg';
      if (targetImport.n!.endsWith('.png') || targetImport.n!.endsWith('.svg')) {
        const absPath = resolve(dirname(filePath), targetImport.n!);
        const relativePath = await getAssetContents.apply(compiler, [absPath, outputPath]);
        const relativeImportPath = normalizeSlashes(relativePath.startsWith('..') ? relativePath : `./${relativePath}`);
        str.overwrite(targetImport.s, targetImport.e, `${relativeImportPath}`);
        return;
      }

      let absoluteImportPath = '';
      for (const alias of Object.keys(aliasRecord)) {
        // prefix
        if (targetImport.n!.startsWith(`${alias}/`)) {
          absoluteImportPath = join(aliasRecord[alias], targetImport.n!.slice(alias.length + 1));
          break;
        }
        // full path
        if (targetImport.n! === alias) {
          absoluteImportPath = aliasRecord[alias];
          break;
        }
      }

      if (absoluteImportPath) {
        const relativePath = relative(dirname(filePath), absoluteImportPath);
        const relativeImportPath = normalizeSlashes(relativePath.startsWith('..') ? relativePath : `./${relativePath}`);
        str.overwrite(targetImport.s, targetImport.e, relativeImportPath);
        return;
      }
      // redirect style path
      const nameArr = targetImport.n!.split('.');
      let ext = nameArr.pop();
      if (nameArr.length > 1) {
        const isModule = nameArr.length > 1 && nameArr[nameArr.length - 1] === 'module';
        const name = nameArr.join('.');
        if (ext === 'less' || ext === 'sass' || ext === 'scss' || ext === 'css') {
          ext = 'css';
          if (isModule) {
            str.appendLeft(targetImport.se, `\nimport '${name}.${ext}'`);
            str.overwrite(targetImport.s, targetImport.e, `${name}`);
          } else {
            str.overwrite(targetImport.s, targetImport.e, `${name}.${ext}`);
          }
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
      compiler.hooks.transform.tapPromise(pluginName, async (args) => {
        const { code, path: id } = args;
        const { alias: originalAlias } = compiler.config.resolve;
        if (!code || !scriptsFilter(id)) {
          return args;
        }
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

        // transform alias to absolute path
        const alias = Object.entries(originalAlias).reduce<typeof originalAlias>((result, [name, target]) => {
          if (!isAbsolute(target)) {
            result[name] = resolve(compiler.config.root, target);
          } else {
            result[name] = target;
          }
          return result;
        }, {});
        const { sourceDir, outdir } = compiler.config;
        const basePath = relative(sourceDir, id);
        const outputPath = join(outdir, basePath);
        const str = await redirectImport(compiler, code, imports, alias, id, outputPath);
        return {
          ...args,
          code: str.toString(),
          map: str.generateMap({
            hires: true,
            includeContent: true,
          }),
        };
      });
    },
  };
};
