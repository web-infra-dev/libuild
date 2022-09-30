import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('fixture:assets', () => {
  it('wav file should bundled', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      asset: {
        limit: 14 * 1024,
      },
    });
    await bundler.build();
    bundler.expectJSOutputMatchSnapshot();
  });
});
