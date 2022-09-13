import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('fixture:less', function () {
  it('prependData', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      input: {
        basic: './basic.less',
      },
      style: {
        less: {
          prependData: `@base-color: #c6538c;`,
        },
      },
    });
    await bundler.build();
    bundler.expectCSSOutputMatchSnapshot();
  });
});
