import { isObject, deepMerge } from '@modern-js/libuild-utils';
import { transform } from 'esbuild';
import { minify as terserMinify, MinifyOptions as TerserMinifyOptions } from 'terser';
import { ChunkType, SourceMap, ILibuilder, LibuildPlugin, CLIConfig } from '../types';
import { normalizeSourceMap } from '../utils';

export const minifyPlugin = (): LibuildPlugin => {
  const pluginName = 'libuild:minify';
  return {
    name: pluginName,
    apply(compiler) {
      compiler.hooks.processAsset.tapPromise(pluginName, async (chunk) => {
        if (chunk.type === ChunkType.chunk) {
          const code = chunk.contents.toString();
          const result = await minify.call(compiler, code);
          return {
            ...chunk,
            contents: result.code || chunk.contents,
            map: result.map,
          };
        }
        return chunk;
      });
    },
  };
};

function resolveTerserOptions(
  terserOptions: TerserMinifyOptions | 'terser',
  { sourceMap, target }: { sourceMap: boolean; target: CLIConfig['target'] }
): TerserMinifyOptions {
  // cra: https://github.com/facebook/create-react-app/blob/main/packages/react-scripts/config/webpack.config.js#L237
  return deepMerge(
    {
      compress: {
        ecma: target === 'es5' ? 5 : 2020,
        inline: 2,
        comparisons: false,
      },
      format: { keep_quoted_props: true, comments: false },
      // Return object to avoid redundant `JSON.parse` in remapping
      sourceMap: sourceMap
        ? {
            asObject: true,
            // `includeSources` is not necessary for minification,
            // and we can utilize this to reduce the size of the source map.
            includeSources: false,
          }
        : false,
      safari10: true,
      toplevel: true,
    },
    isObject(terserOptions) ? terserOptions : {}
  );
}

async function minify(this: ILibuilder, code: string): Promise<{ code: string; map?: SourceMap }> {
  const needSourceMap = Boolean(this.config.sourceMap);
  if (this.config.minify === 'esbuild') {
    const result = await transform(code, {
      sourcemap: needSourceMap,
      minify: true,
      target: this.config.target,
    });
    return {
      code: result.code,
      map: normalizeSourceMap(result.map, { needSourceMap }),
    };
  }

  if (this.config.minify) {
    const terserOptions = resolveTerserOptions(this.config.minify, {
      sourceMap: Boolean(needSourceMap),
      target: this.config.target,
    });
    const result = await terserMinify(code, {
      ...terserOptions,
      sourceMap: needSourceMap,
    });
    return {
      code: result.code!,
      map: normalizeSourceMap(result.map as any, { needSourceMap }),
    };
  }

  return { code };
}
