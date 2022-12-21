import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('fixture:redirect', () => {
  it('redirect', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      resolve: {
        alias: {
          '@': 'src',
        },
      },
      bundle: false,
      input: ['./src'],
    });
    await bundler.build();
    bundler.expectJSOutputMatchSnapshot();
  });
});
