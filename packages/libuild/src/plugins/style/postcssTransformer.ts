import { deepMerge } from '@modern-js/libuild-utils';
import postcss from 'postcss';
import postcssrc from 'postcss-load-config';
import { DEFAULT_NODE_ENV } from '../../constants/config';
import { ILibuilder, PostcssOptions, Style } from '../../types';
import { postcssUrlPlugin } from './postcssUrlPlugin';
import { getHash } from './utils';

async function loadPostcssConfig(root: string, postcssOptions: Style['postcss']): Promise<PostcssOptions> {
  let resolvedPostcssConfig: postcssrc.Result | null = null;
  const options = postcssOptions ?? {};
  try {
    resolvedPostcssConfig = await postcssrc(
      {
        env: process.env.NODE_ENV || DEFAULT_NODE_ENV,
      },
      root
    );
  } catch (e) {
    if (!/No PostCSS Config found/.test((e as Error)?.message)) {
      throw e;
    }
    resolvedPostcssConfig = null;
  }
  if (resolvedPostcssConfig) {
    return deepMerge(
      {
        processOptions: resolvedPostcssConfig.options,
        plugins: resolvedPostcssConfig.plugins,
      },
      options
    );
  }
  return options;
}
const cssLangs = `\\.(css|less|sass|scss|styl|stylus|pcss|postcss)($|\\?)`;
const cssModuleRE = new RegExp(`\\.module${cssLangs}`);
const cssModuleContentsMap: Map<string, string> = new Map();

export const getCssModuleContents = (originalFilePath: string) => {
  return cssModuleContentsMap.get(originalFilePath);
};

export const postcssTransformer = async (
  css: string,
  entryPath: string,
  compilation: ILibuilder
): Promise<{
  code: string;
  loader: 'js' | 'css';
}> => {
  const postcssConfig = await loadPostcssConfig(compilation.config.root, compilation.config.style.postcss);
  const { autoModules = true, plugins = [], processOptions = {} } = postcssConfig;
  let modules: Record<string, string> = {};
  const finalPlugins = [
    postcssUrlPlugin({
      entryPath,
      compilation,
    }),
    ...plugins,
  ];
  const isModule =
    typeof autoModules === 'boolean' ? autoModules && cssModuleRE.test(entryPath) : autoModules.test(entryPath);
  if (isModule) {
    finalPlugins.push(
      (await import('postcss-modules')).default({
        generateScopedName(name: string, filename: string, css: string) {
          const hash = getHash(filename, 'utf-8').substring(0, 5);
          return `${name}_${hash}`;
        },
        getJSON(cssFileName: string, _modules: Record<string, string>, outputFileName: string) {
          modules = _modules;
        },
        async resolve(id: string) {
          return id;
        },
      })
    );
  }
  let loader: 'js' | 'css' = 'css';
  let { css: code } = await postcss(finalPlugins).process(css, {
    from: entryPath,
    ...processOptions,
  });
  if (Object.values(modules).length) {
    // add hash query for same path, let esbuild cache invalid
    cssModuleContentsMap.set(entryPath, code);
    code = `import "${entryPath}?css_virtual&hash=${getHash(code, 'utf-8')}";export default ${JSON.stringify(modules)}`;
    loader = 'js';
  }

  return {
    code,
    loader,
  };
};
