import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('fixture:sass', function () {
  it('basic example should bundle', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      input: {
        basic: './basic.scss',
      },
    });
    await bundler.build();
    bundler.expectCSSOutputMatchSnapshot();
  });
});
