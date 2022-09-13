import path from 'path';
import fs from 'fs';

export const getAllDeps = <T>(root: string) => {
  try {
    const json = JSON.parse(fs.readFileSync(path.resolve(root, './package.json'), 'utf8'));

    return {
      dep: [...Object.keys((json.dependencies as T | undefined) || {})],
      devDep: [...Object.keys((json.devDependencies as T | undefined) || {})],
      peerDep: [...Object.keys((json.peerDependencies as T | undefined) || {})],
    };
  } catch (e) {
    return {
      dep: [],
      devDep: [],
      peerDep: [],
    };
  }
};
