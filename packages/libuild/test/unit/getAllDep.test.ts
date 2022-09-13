import assert from 'assert';
import { getAllDeps } from '../../src/utils';

describe('getAllDeps', () => {
  it('default', () => {
    const { dep } = getAllDeps(process.cwd());
    assert(dep.indexOf('esbuild') > -1);
  });
});
