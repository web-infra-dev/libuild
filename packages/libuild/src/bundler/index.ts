import { LogLevel as esbuildLogLevel, BuildResult, BuildOptions, BuildInvalidate, build as esbuild } from 'esbuild';
import * as path from 'path';
import chalk from 'chalk';
import { globby } from 'globby';
import { getLogLevel } from '../logger';
import { LibuildError } from '../error';
import { Callback, ILibuilder, BuildConfig, IBuilderBase } from '../types';
import { adapterPlugin } from './adapter';
import { jsExtensions } from '../core/resolve';
import { ErrorCode } from '../constants/error';
import { Libuilder } from '../core';

function convertLogLevel(level: BuildConfig['logLevel']): esbuildLogLevel {
  if (getLogLevel(level) < getLogLevel('debug')) {
    return 'silent';
  }
  return level;
}

export class EsbuildBuilder implements IBuilderBase {
  compiler: ILibuilder;

  instance!: BuildResult;

  reBuildCount: number;

  constructor(compiler: ILibuilder) {
    this.compiler = compiler;
    this.reBuildCount = 0;
  }

  close(callback?: Callback) {
    try {
      if (this.instance) {
        this.instance.stop?.();
        this.instance.rebuild?.dispose();
      }
      callback?.();
      /* c8 ignore next */
    } catch (err) {
      /* c8 ignore next */
      callback?.(err);
    }
  }

  private async report(error: any) {
    const { compiler } = this;
    compiler.report(this.parseError(error));
    await compiler.hooks.endCompilation.promise(compiler.getErrors());
  }

  private parseError(err: any) {
    const infos: LibuildError[] = [];
    const code = ErrorCode.ESBUILD_BUNDLE_FAILED;
    const parseDetail = (item: any) => {
      if (item.detail) {
        return this.parseError(item.detail);
      }
    };

    if (err.errors) {
      infos.push(
        ...err.errors
          .map((item: any) => {
            return (
              parseDetail(item) ??
              LibuildError.from(item, {
                level: 'Error',
                code,
              })
            );
          })
          .reduce((acc: any[], val: any) => acc.concat(val), [])
      );
    }

    if (err.warnings) {
      infos.push(
        ...err.warnings
          .map((item: any) => {
            return (
              parseDetail(item) ??
              LibuildError.from(item, {
                level: 'Warn',
                code,
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
    const { bundle, sourceDir } = compiler.config;
    // bundleless
    if (!bundle) {
      const jsFiles = await globby(sourceDir, {
        expandDirectories: {
          extensions: ['js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs'],
        },
      });
      const cssFiles = await globby(sourceDir, {
        expandDirectories: {
          extensions: ['css', 'sass', 'scss', 'less'],
        },
      });
      compiler.config.input = jsFiles;
      compiler.config.asset.rebase = true;
      if (cssFiles.length) {
        const childCompiler = await Libuilder.create({
          ...compiler.config,
          input: cssFiles,
          bundle: true,
          entryNames: '[dir]/[name]',
        });
        childCompiler.build();
      }
    }

    const {
      input,
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
      entryNames,
      minify,
      chunkNames,
      jsx,
      esbuildOptions,
    } = compiler.config;

    const esbuildConfig: BuildOptions = {
      entryPoints: input,
      metafile: true,
      define,
      bundle,
      format: 'esm',
      target,
      sourcemap: sourceMap ? 'external' : false,
      mainFields: resolve.mainFields,
      resolveExtensions: jsExtensions,
      splitting,
      watch: false,
      charset: 'utf8',
      incremental: watch,
      logLimit: 5,
      absWorkingDir: root,
      platform,
      write: false,
      logLevel: convertLogLevel(logLevel),
      outdir,
      outbase: sourceDir,
      entryNames,
      chunkNames,
      plugins: [adapterPlugin(this.compiler)],
      minifyIdentifiers: !!minify,
      inject,
      jsx,
    };

    const buildOptions = esbuildOptions(esbuildConfig);
    try {
      this.instance = await esbuild(buildOptions);
      return this.instance;
    } catch (error: any) {
      await this.report(error);

      if (compiler.config.watch) {
        const rebuild = () => {
          return this.build();
        };

        rebuild.dispose = () => undefined;

        this.instance = {
          errors: [],
          warnings: [],
          rebuild: rebuild as BuildInvalidate,
        };

        return this.instance;
      }
    }
  }

  async reBuild(paths: string[]) {
    const { instance, compiler } = this;

    try {
      const start = Date.now();
      compiler.clearErrors();
      await instance.rebuild?.();
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

  canRebuild(): boolean {
    return !!this.instance;
  }
}
