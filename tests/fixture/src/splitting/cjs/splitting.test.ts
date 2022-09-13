import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('fixture:splitting', () => {
  it('cjs', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      format: 'cjs',
      splitting: true,
    });
    await bundler.build();
    bundler.expectJSOutputMatchSnapshot();
  });
});
