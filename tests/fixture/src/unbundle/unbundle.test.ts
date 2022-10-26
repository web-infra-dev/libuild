import { expect, getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('fixture:unbundle', () => {
  it('unbundle', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      input: ['src/*'],
      bundle: false,
    });
    await bundler.build();
    const jsOutput = bundler.getJSOutput();
    const values = Object.values(jsOutput);
    expect(values.length === 2).to.be.true;
    bundler.expectJSOutputMatchSnapshot();
  });
});
