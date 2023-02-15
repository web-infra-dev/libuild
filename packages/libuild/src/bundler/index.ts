import { LogLevel as esbuildLogLevel, BuildResult, BuildOptions, BuildContext, context, build } from 'esbuild';
import * as path from 'path';
import chalk from 'chalk';
import { getLogLevel } from '../logger';
import { LibuildError } from '../error';
import { Callback, ILibuilder, BuildConfig, IBuilderBase, EsbuildResultInfo, EsbuildError } from '../types';
import { adapterPlugin } from './adapter';
import { jsExtensions } from '../core/resolve';
import { ErrorCode } from '../constants/error';

function convertLogLevel(level: BuildConfig['logLevel']): esbuildLogLevel {
  if (getLogLevel(level) < getLogLevel('debug')) {
    return 'silent';
  }
  return level;
}

export class EsbuildBuilder implements IBuilderBase {
  compiler: ILibuilder;

  instance?: BuildContext;

  result?: BuildResult;

  reBuildCount: number;

  constructor(compiler: ILibuilder) {
    this.compiler = compiler;
    this.reBuildCount = 0;
  }

  close(callback?: Callback) {
    try {
      this.instance?.cancel();
      this.instance?.dispose();
      callback?.();
      /* c8 ignore next */
    } catch (err) {
      /* c8 ignore next */
      callback?.(err);
    }
  }

  private async report(error: EsbuildResultInfo) {
    const { compiler } = this;
    compiler.report(this.parseError(error));
    await compiler.hooks.endCompilation.promise(compiler.getErrors());
  }

  private parseError(err: EsbuildResultInfo) {
    const infos: LibuildError[] = [];
    const parseDetail = (item: EsbuildError) => {
      if (item.detail) {
        return this.parseError(item.detail);
      }
    };

    if (err.errors) {
      infos.push(
        ...err.errors
          .map((item: EsbuildError) => {
            return (
              parseDetail(item) ??
              LibuildError.from(item, {
                level: 'Error',
                code: ErrorCode.ESBUILD_ERROR,
              })
            );
          })
          .reduce((acc: any[], val: any) => acc.concat(val), [])
      );
    }

    if (err.warnings) {
      infos.push(
        ...err.warnings
          .map((item: EsbuildError) => {
            return (
              parseDetail(item) ??
              LibuildError.from(item, {
                level: 'Warn',
                code: ErrorCode.ESBUILD_WARN,
              })
            );
          })
          .reduce((acc: any[], val: any) => acc.concat(val), [])
      );
    }

    if (infos.length === 0) {
      infos.push(LibuildError.from(err));
    }

    return infos;
  }

  async build() {
    // /**
    //  * it's pity that esbuild doesn't supports inline tsconfig
    //  * fix me later after  https://github.com/evanw/esbuild/issues/943 resolved
    //  */
    // const tsConfigPath = path.resolve(__dirname, '../config/tsconfig.json');
    // if (!fs.existsSync(tsConfigPath)) {
    //   throw new Error(`failed to load tsconfig at  ${tsConfigPath}`);
    // }

    const { compiler } = this;
    const {
      input,
      bundle,
      define,
      target,
      sourceMap,
      resolve,
      watch,
      platform,
      logLevel,
      inject,
      root,
      splitting,
      outdir,
      outbase,
      entryNames,
      minify,
      chunkNames,
      jsx,
      esbuildOptions,
      format,
      asset,
    } = compiler.config;

    let esbuildFormat = format === 'umd' ? 'esm' : format;
    const esbuildTarget = compiler.plugins.find((plugin) => plugin.name === 'libuild:swc-es5') ? 'esnext' : target;
    if (bundle && splitting && format === 'cjs') {
      esbuildFormat = 'esm';
    }

    const esbuildConfig: BuildOptions = {
      entryPoints: input,
      metafile: true,
      define,
      bundle,
      format: esbuildFormat,
      target: esbuildTarget,
      sourcemap: sourceMap ? 'external' : false,
      mainFields: resolve.mainFields,
      resolveExtensions: jsExtensions,
      splitting,
      charset: 'utf8',
      logLimit: 5,
      absWorkingDir: root,
      platform,
      write: false,
      logLevel: convertLogLevel(logLevel),
      outdir,
      outbase,
      entryNames,
      chunkNames,
      plugins: [adapterPlugin(this.compiler)],
      minifyIdentifiers: !!minify,
      minify: minify === 'esbuild',
      inject,
      jsx,
      supported: {
        'dynamic-import': bundle || format !== 'cjs',
      },
      assetNames: `${asset.outdir}/[name].[hash]`,
    };

    const buildOptions = esbuildOptions(esbuildConfig);
    try {
      if (watch) {
        this.instance = await context(buildOptions);
        this.result = await this.instance.rebuild();
      } else {
        this.result = await build(buildOptions);
      }
      if (this.result.warnings.length) {
        this.report(this.result);
      }
    } catch (error: any) {
      await this.report(error);

      if (watch) {
        this.instance?.cancel();
      }
    }
  }

  async reBuild(paths: string[], type: 'add' | 'change') {
    const { instance, compiler } = this;
    const text = type === 'add' ? 'added' : 'changed';
    compiler.hooks.watchChange.call(paths);
    if (paths.length > 0) {
      compiler.config.logger.info(`${chalk.underline(paths.join(' '))} ${text}`);
    }
    try {
      const start = Date.now();
      if (type === 'add') {
        await this.build();
      } else {
        compiler.clearErrors();
        this.result = await instance?.rebuild();
      }
      compiler.config.logger.info(
        chalk.green`Rebuild Successfully in ${Date.now() - start}ms`,
        chalk.yellow`Rebuild Count: ${++this.reBuildCount}`
      );
    } catch (error: any) {
      this.report(error);
      compiler.printErrors();
    }
  }

  shouldRebuild(paths: string[]): boolean {
    for (const item of paths) {
      const full = path.join(this.compiler.config.root, item);

      if (this.compiler.watchedFiles.has(full)) {
        return true;
      }
    }
    return false;
  }
}
