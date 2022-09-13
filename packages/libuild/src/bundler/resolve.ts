import { createFilter } from '@rollup/pluginutils';
import { resolvePathAndQuery } from '@modern-js/libuild-utils';
import path from 'path';
import fs from 'fs';
import module from 'module';
import type { BuilderResolveOptions, ILibuilder } from '../types';

type BuilderResolve = ILibuilder['resolve'];

const HTTP_PATTERNS = /^(https?:)?\/\//;
const DATAURL_PATTERNS = /^data:/;
const HASH_PATTERNS = /#[^#]+$/;
export const isUrl = (source: string) =>
  HTTP_PATTERNS.test(source) || DATAURL_PATTERNS.test(source) || HASH_PATTERNS.test(source);

/**
 * return sideEffects
 * @todo fix subpath later
 * @param filePath
 * @returns
 */
function getSideEffects(filePath: string | boolean): boolean | undefined {
  if (typeof filePath === 'boolean') {
    return false;
  }
  let sideEffects;
  let curDir = path.dirname(filePath);
  let pkgPath = '';
  try {
    while (curDir !== path.dirname(curDir)) {
      if (fs.existsSync(path.resolve(curDir, 'package.json'))) {
        pkgPath = path.resolve(curDir, 'package.json');
        break;
      }
      curDir = path.dirname(curDir);
    }
  } catch (err) {
    // just ignore in case some system permission exception happens
  }
  if (!pkgPath) {
    return undefined;
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  if (typeof pkg.sideEffects === 'boolean') {
    sideEffects = pkg.sideEffects;
  } else if (Array.isArray(pkg.sideEffects)) {
    sideEffects = createFilter(pkg.sideEffects, null, {
      resolve: path.dirname(pkgPath),
    })(filePath);
  } else {
    sideEffects = true;
  }
  return sideEffects;
}

function isString(str: unknown): str is string {
  return typeof str === 'string';
}

export function installResolve(compiler: ILibuilder): BuilderResolve {
  const { external } = compiler.config;
  const regExternal = external.filter((item): item is RegExp => !isString(item));
  const externalList = external
    .filter(isString)
    .concat(Object.keys(compiler.config.globals))
    .concat(compiler.config.platform === 'node' ? module.builtinModules : []);

  const externalMap = externalList.reduce((map, item) => {
    map.set(item, true);
    return map;
  }, new Map<string, boolean>());

  function getResolverDir(importer?: string, resolveDir?: string) {
    return resolveDir ?? (importer ? path.dirname(importer) : compiler.config.root);
  }

  function getResolveResult(source: string, opt: BuilderResolveOptions) {
    if (source.endsWith('.css')) {
      return compiler.config.css_resolve(source, getResolverDir(opt.importer, opt.resolveDir));
    }

    return compiler.config.node_resolve(source, getResolverDir(opt.importer, opt.resolveDir), opt.kind);
  }

  function getIsExternal(name: string) {
    if (externalMap.get(name)) {
      return true;
    }

    if (regExternal.some((reg) => reg.test(name))) {
      return true;
    }

    return false;
  }

  return async (source, options = {}) => {
    if (isUrl(source)) {
      return {
        path: source,
        external: true,
      };
    }

    const { originalFilePath, rawQuery } = resolvePathAndQuery(source);
    const suffix = (rawQuery ?? '').length > 0 ? `?${rawQuery}` : '';
    const isExternal = getIsExternal(originalFilePath);
    const resultPath = isExternal ? originalFilePath : getResolveResult(originalFilePath, options);

    return {
      external: isExternal,
      namespace: isExternal ? undefined : 'file',
      sideEffects: isExternal || options.skipSideEffects ? false : getSideEffects(resultPath),
      path: resultPath,
      suffix,
    };
  };
}
