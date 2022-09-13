import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('fixture:env', () => {
  it('env', async () => {
    process.env.LIBUILD_NATIVE_REMAPPING = 'false';
    const bundler = await getLibuilderTest({
      root: __dirname,
      input: {
        main: './index.ts',
      },
    });
    await bundler.build();
    bundler.expectJSOutputMatchSnapshot();
  });
});
