import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('fixture:globals', () => {
  it('basic', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      external: ['react'],
      globals: {
        react: 'React',
      },
    });
    await bundler.build();

    bundler.expectJSOutputMatchSnapshot();
  });
});
