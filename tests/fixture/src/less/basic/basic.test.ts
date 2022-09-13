import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('fixture:less', function () {
  it('basic example should bundle', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      input: {
        basic: './basic.less',
      },
    });
    await bundler.build();
    bundler.expectCSSOutputMatchSnapshot();
  });
});
