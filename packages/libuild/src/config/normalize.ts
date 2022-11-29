import path from 'path';
import { mapValue } from '@modern-js/libuild-utils';
import { globby } from 'globby';
import { createLogger } from '../logger';
import { DEFAULT_CONFIG_FILE_NAME, DEFAULT_OUTBASE, DEFAULT_OUTDIR } from '../constants/config';
import { createResolver, cssExtensions, jsExtensions } from '../core/resolve';
import { CLIConfig, BuildConfig, LibuildPlugin, ResolveNormalized } from '../types';
import { getClientEnvironment, LibuildEnvName, getAllDeps } from '../utils';

export function getDefaultConfigFilePath(root: string, configFile?: string) {
  return path.resolve(root, configFile || DEFAULT_CONFIG_FILE_NAME);
}

export async function normalizeConfig(config: CLIConfig): Promise<BuildConfig> {
  const root = config.root ?? process.cwd();
  const defaultInput = {
    index: path.resolve(root, './src/index.ts'),
  };
  const resolveInputPath = (p: string) => {
    if (typeof p === 'string') {
      return path.resolve(root, p);
    }
    throw new Error('The content of `input` must be a string.');
  };
  let input: BuildConfig['input'];
  if (Array.isArray(config.input)) {
    const jsFiles = await globby(config.input, {
      expandDirectories: {
        extensions: ['js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs', 'css', 'sass', 'scss', 'less'],
      },
      cwd: root,
    });
    input = jsFiles;
  } else {
    input = mapValue(config.input ?? defaultInput, resolveInputPath);
  }
  const configFile = getDefaultConfigFilePath(root, config.configFile);
  const logLevel = config.logLevel ?? 'info';
  const logger = createLogger({ level: logLevel });
  const resolve: ResolveNormalized = {
    alias: config.resolve?.alias ?? {},
    mainFiles: config.resolve?.mainFiles ?? ['index'],
    mainFields: config.resolve?.mainFields ?? ['module', 'browser', 'main'],
    preferRelative: config.resolve?.preferRelative ?? false,
  };
  const plugins: LibuildPlugin[] = config.plugins ?? [];
  const sourceMap = config.sourceMap ?? false;
  const target = config.target ?? 'es6';

  const globals = config.globals ?? {};

  const rawEnv = getClientEnvironment(root).raw;

  logger.debug('Current env', JSON.stringify(rawEnv, null, 4));

  const define = {
    ...Object.keys(rawEnv).reduce((acc, key) => {
      acc[`process.env.${key}`] = JSON.stringify(rawEnv[key as LibuildEnvName]);
      return acc;
    }, {} as Record<string, string>),
    'import.meta.env': JSON.stringify({
      NODE_ENV: JSON.stringify(rawEnv.NODE_ENV),
      MODE: JSON.stringify(rawEnv.NODE_ENV),
    }),
    ...config.define,
  };

  const watch = config.watch ?? false;
  const autoExternal = config.autoExternal ?? true;
  const { dep, peerDep } = getAllDeps(root, autoExternal);
  const external = [
    ...[...dep, ...peerDep].map((dep) => new RegExp(`^${dep}($|\\/|\\\\)`)),
    ...(config.external ?? []),
  ];
  const platform = config.platform ?? 'node';
  const bundle = config.bundle ?? true;
  const metafile = config.metafile ?? false;
  const style = config.style ?? {};
  const loader = config.loader ?? {};
  const inject = config.inject ?? [];
  const asset = config.asset ?? {};
  const minify = config.minify ?? false;
  const splitting = config.splitting ?? false;
  const outdir = path.resolve(root, config.outdir ?? DEFAULT_OUTDIR);
  const outbase = path.resolve(root, config.outbase ?? DEFAULT_OUTBASE);

  const sourceDir = path.resolve(root, config.sourceDir ?? 'src');
  const entryNames = config.entryNames ?? (bundle ? '[name]' : '[dir]/[name]');
  const chunkNames = config.chunkNames ?? entryNames;
  const format = config.format ?? 'esm';
  const clean = config.clean ?? false;
  const jsx = config.jsx ?? 'automatic';
  const esbuildOptions = config.esbuildOptions ?? ((config) => config);

  return {
    esbuildOptions,
    jsx,
    chunkNames,
    inject,
    loader,
    metafile,
    bundle,
    style,
    root,
    resolve,
    logLevel,
    logger,
    plugins,
    target,
    define,
    configFile,
    sourceMap,
    node_resolve: createResolver({
      resolveType: 'js',
      root,
      ...resolve,
      platform,
      extensions: jsExtensions,
    }),
    css_resolve: createResolver({
      resolveType: 'css',
      root,
      ...resolve,
      platform,
      preferRelative: true,
      extensions: cssExtensions,
    }),
    input,
    globals,
    watch,
    outdir,
    outbase,
    sourceDir,
    minify,
    splitting,
    entryNames,
    format,
    clean,
    external,
    platform,
    asset,
    autoExternal,
  };
}
