import { expect, getLibuilderTest } from '@modern-js/libuild-test-toolkit';
import { es5InputPlugin } from '@modern-js/libuild-plugin-es5';

describe('fixture:corejs', function () {
  it('corejs:full', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      plugins: [es5InputPlugin({ polyfill: true })],
    });
    await bundler.build();
    const jsChunk = Object.values(bundler.getJSOutput());
    expect(jsChunk.length === 1).to.true;
    expect(jsChunk[0].contents.includes('.pnpm/core-js@3.21.1')).to.true;
  });
});
