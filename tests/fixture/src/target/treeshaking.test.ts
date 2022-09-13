import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('fixture:target', () => {
  it('2015', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      target: 'es2015',
      input: {
        es2015: './index.ts',
      },
    });
    await bundler.build();
    bundler.expectJSOutputMatchSnapshot();
  });
  it('2017', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      input: {
        es2017: './index.ts',
      },
      target: 'es2017',
    });
    await bundler.build();
    bundler.expectJSOutputMatchSnapshot();
  });
});
