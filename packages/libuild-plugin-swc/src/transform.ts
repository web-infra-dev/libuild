import type { LibuildPlugin } from '@modern-js/libuild';
import { Compiler, TransformConfig } from '@modern-js/swc-plugins';
import { isJsExt, resolvePathAndQuery, isJsLoader, deepMerge } from '@modern-js/libuild-utils';

export type Config = {
  // In some cases it is necessary to use the specified parser. eg:
  // code: `import { Type } from 'xx'`, `Type` is a type definition.
  // Using swc's ts parser, these type definition can be removed.
  useJscParser?: 'auto' | 'typescript' | 'ecmascript';
};

export const getJscParser = (
  useJscParser: Config['useJscParser'],
  options: {
    isTs: boolean;
    enableTsx: boolean;
  }
) => {
  const { enableTsx, isTs } = options;
  if (useJscParser === 'typescript') {
    return {
      syntax: 'typescript',
      tsx: enableTsx,
      decorators: true,
    };
  }
  if (useJscParser === 'ecmascript') {
    return {
      syntax: 'ecmascript',
      jsx: true,
      decorators: true,
    };
  }
  return isTs
    ? {
        syntax: 'typescript',
        tsx: enableTsx,
        decorators: true,
      }
    : {
        syntax: 'ecmascript',
        jsx: true,
        decorators: true,
      };
};

export const transformPlugin = (options?: TransformConfig, config?: Config): LibuildPlugin => {
  const pluginName = 'libuild:swc-transform';
  const { useJscParser = 'auto' } = config ?? {};
  return {
    name: pluginName,
    apply(compiler) {
      compiler.hooks.transform.tapPromise({ name: pluginName }, async (args) => {
        const { originalFilePath } = resolvePathAndQuery(args.path);
        const isTs = args.loader === 'tsx' || args.loader === 'ts' || /\.tsx?$/i.test(originalFilePath);
        const enableTsx = args.loader === 'tsx' || /\.tsx$/i.test(originalFilePath);

        if (isJsExt(originalFilePath) || isJsLoader(args.loader)) {
          const mergeOptions: TransformConfig = deepMerge(
            {
              filename: originalFilePath,
              sourceMaps: Boolean(compiler.config.sourceMap),
              inputSourceMap: false,
              swcrc: false,
              configFile: false,
              jsc: {
                parser: getJscParser(useJscParser, { isTs, enableTsx }),
                target: 'es2022',
              },
              isModule: 'unknown',
              extensions: {},
            },
            options || {}
          );
          const swcCompiler = new Compiler(mergeOptions);
          const result = await swcCompiler.transformSync(originalFilePath, args.code);
          return {
            ...args,
            code: result.code,
            map: typeof result.map === 'string' ? JSON.parse(result.map) : result.map,
          };
        }
        return args;
      });
    },
  };
};
