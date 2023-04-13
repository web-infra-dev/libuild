import type { TransformConfig, ImportItem } from '@modern-js/swc-plugins';
import type { LibuildPlugin, Source } from '@modern-js/libuild';
import { Compiler } from '@modern-js/swc-plugins';
import { resolvePathAndQuery, isJsExt, isJsLoader } from '@modern-js/libuild-utils';
import { getSwcTarget, getModuleConfig } from './utils';

// libuild-plugin-swc options
export interface SwcTransformOptions {
  emitDecoratorMetadata?: boolean;
  externalHelpers?: boolean;
  pluginImport?: ImportItem[];
}

export const swcTransformPlugin = (
  options: SwcTransformOptions = {}
  // swcCompilerOptions?: TransformConfig
): LibuildPlugin => {
  const pluginName = 'libuild:swc-transform';
  return {
    name: pluginName,
    apply(compiler) {
      compiler.hooks.transform.tapPromise(pluginName, async (source): Promise<Source> => {
        const { originalFilePath } = resolvePathAndQuery(source.path);
        const { emitDecoratorMetadata = false, externalHelpers = false, pluginImport = [] } = options;
        const enableTsx = source.loader === 'tsx' || source.loader === 'jsx' || /\.tsx$|\.jsx$/i.test(originalFilePath);

        // format is umd, disable swc-transform
        if (compiler.config.format === 'umd') {
          return source;
        }

        if (isJsExt(originalFilePath) || isJsLoader(source.loader)) {
          const { target, format, jsx } = compiler.config;
          const module = getModuleConfig(format);

          const swcCompilerOptions: TransformConfig = {
            filename: originalFilePath,
            sourceMaps: Boolean(compiler.config.sourceMap),
            inputSourceMap: false,
            swcrc: false,
            configFile: false,
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: enableTsx,
                decorators: true,
              },
              transform: {
                react: {
                  runtime: jsx === 'transform' ? 'classic' : 'automatic',
                },
              },
              externalHelpers,
              target: getSwcTarget(target),
            },
            isModule: true,
            module,
            extensions: {
              pluginImport,
            },
            // extensions:
            //   bundle && injectHelperToDist
            //     ? {
            //         lockCorejsVersion: {
            //           corejs: 'core-js',
            //           swcHelpers: SWC_HELPERS_DIR_PATH,
            //         },
            //       }
            //     : {},
          };

          if (emitDecoratorMetadata) {
            swcCompilerOptions.jsc!.transform = {
              ...swcCompilerOptions.jsc!.transform,
              legacyDecorator: true,
              decoratorMetadata: true,
            };
          }

          const swcCompiler = new Compiler(swcCompilerOptions);
          const result = await swcCompiler.transform(originalFilePath, source.code);
          return {
            ...source,
            code: result.code,
            map: typeof result.map === 'string' ? JSON.parse(result.map) : result.map,
          };
        }
        return source;
      });
    },
  };
};
