import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('fixture:format:umd', () => {
  it('format umd', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      format: 'umd',
      splitting: true,
    });
    await bundler.build();

    bundler.expectJSOutputMatchSnapshot();
  });
});
