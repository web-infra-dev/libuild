import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('fixture:splitting', () => {
  it('esm', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      format: 'esm',
      splitting: true,
    });
    await bundler.build();
    bundler.expectJSOutputMatchSnapshot();
  });
});
