/**
 * This plugin is used to redirectImport only in unbundle mode
 * Taking from https://github.com/ice-lab/icepkg/blob/main/packages/pkg/src/plugins/transform/alias.ts
 */
import { isAbsolute, resolve, relative, join, dirname, win32, basename, extname } from 'path';
import { init, parse } from 'es-module-lexer';
import type { ImportSpecifier } from 'es-module-lexer';
import MagicString from 'magic-string';
import { resolvePathAndQuery } from '@modern-js/libuild-utils';
import { ILibuilder, LibuildPlugin } from '../types';
import { getAssetContents, assetExt } from './asset';
import { isCssModule } from './style/postcssTransformer';

function normalizeSlashes(file: string) {
  return file.split(win32.sep).join('/');
}

async function redirectImport(
  compiler: ILibuilder,
  code: string,
  imports: readonly ImportSpecifier[],
  aliasRecord: Record<string, string>,
  filePath: string,
  outputDir: string
): Promise<MagicString> {
  const str: MagicString = new MagicString(code);

  await Promise.all(
    imports.map(async (targetImport) => {
      // redirect asset path
      // import xxx from './xxx.svg';
      if (assetExt.filter((ext) => targetImport.n!.endsWith(ext)).length) {
        const absPath = resolve(dirname(filePath), targetImport.n!);
        const relativeImportPath = await getAssetContents.apply(compiler, [absPath, outputDir]);
        str.overwrite(targetImport.s, targetImport.e, `${relativeImportPath}`);
        return;
      }
      // redirect alias
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
      // css module
      const { originalFilePath, query } = resolvePathAndQuery(targetImport.n!);
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
        str.overwrite(targetImport.s, targetImport.e, `./${base}`);
      }
      // less sass
      const ext = extname(targetImport.n!);
      if (ext === '.less' || ext === '.sass' || ext === '.scss' || ext === '.css') {
        if (isCssModule(targetImport.n!, compiler.config.style?.autoModules ?? true)) {
          str.overwrite(targetImport.s, targetImport.e, `${targetImport.n!.slice(0, -ext.length)}`);
        } else {
          str.overwrite(targetImport.s, targetImport.e, `${targetImport.n!.slice(0, -ext.length)}.css`);
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
        const { alias: originalAlias } = compiler.config.resolve;
        if (!code) {
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

        const str = await redirectImport(compiler, code, imports, alias, id!, dirname(fileName));
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
