import { expect } from '@modern-js/libuild-test-toolkit';
import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('fixture:minify', () => {
  it('when `minify` is `esbuild` + target es6', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      target: 'es6',
      minify: 'esbuild',
      
    });
    await bundler.build();
    const jsOutput = bundler.getJSOutput();
    const jsChunk = Object.values(jsOutput);
    expect(jsChunk.length === 1).to.be.true;
    expect(jsChunk[0].contents).toMatchSnapshot();
  });
});
