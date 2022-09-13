import convertSourceMap from 'convert-source-map';
import ampremapping from '@ampproject/remapping';
import type { SourceMap } from '../types';

import { LibuildEnv, getClientEnvironment } from './env';

export type MergeMapResult = {
  toString: () => string;
  toMap: () => SourceMap;
  toComment: () => string;
};

// Support fallback to JS remapping if native failed, LIBUILD_NATIVE_REMAPPING=true

const getJsImplementation = (mapList: SourceMap[]): MergeMapResult => {
  const map = ampremapping(mapList as any[], () => null);

  return {
    toMap: () => map as SourceMap,
    toString: () => map.toString(),
    toComment: () => convertSourceMap.fromObject(map).toComment(),
  };
};

const getNativeImplementation = (mapList: SourceMap[]): MergeMapResult => {
  const map = require('@speedy-js/source-map').SourceMap.mergeMaps(mapList);

  return {
    toMap: () => map.toMap(),
    toString: () => map.toString(),
    toComment: () => map.toComment(),
  };
};

type Count = { native: number; js: number };
export function mergeSourcemaps(
  mapList: SourceMap[],
  opts: { native: boolean }
): { result: MergeMapResult; count: Count } {
  const count: Count = { native: 0, js: 0 };
  try {
    if (opts.native) {
      count.native += 1;
      return { result: getNativeImplementation(mapList), count };
    }
    count.js += 1;
    return { result: getJsImplementation(mapList), count };
  } catch (err) {
    count.js += 1;
    return { result: getJsImplementation(mapList), count };
  }
}

export function mergeMaps(mapList: SourceMap[]): MergeMapResult {
  const LIBUILD_NATIVE_REMAPPING = getClientEnvironment().raw[LibuildEnv.LIBUILD_NATIVE_REMAPPING] === 'true';
  const { result } = mergeSourcemaps(mapList, { native: LIBUILD_NATIVE_REMAPPING });
  return result;
}
