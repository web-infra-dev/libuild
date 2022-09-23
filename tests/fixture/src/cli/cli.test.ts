import { run } from '@modern-js/libuild';
import fs from 'fs';
import path from 'path';
import { expect } from '@modern-js/libuild-test-toolkit';

describe('fixture:cli', () => {
  it('no-bool', async () => {
    await run(['index.ts', '--no-bundle', `--root=${__dirname}`, '--metafile', '--source-map']);
    // arguments
    expect(fs.existsSync(path.resolve(__dirname, 'dist/index.js'))).to.be.true;
    // no-boolean
    expect(fs.existsSync(path.resolve(__dirname, 'dist/a.js'))).to.be.false;
    // boolean
    expect(fs.existsSync(path.resolve(__dirname, 'dist/index.js.map'))).to.be.true;
    const hasMetaFile =
      fs.readdirSync(path.resolve(__dirname, './dist')).filter((name) => name.startsWith('metafile')).length > 0;
    expect(hasMetaFile).to.be.true;
  });
});
