import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('fixture:less:function', function () {
  it('work fine with less function', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      input: {
        each: './each.less',
        range: './range.less',
      },
      style: {
        less: {
          javascriptEnabled: true,
        },
      },
    });
    await bundler.build().catch((e) => {
      console.error(e);
      throw e;
    });
    bundler.expectCSSOutputMatchSnapshot();
  });
});
