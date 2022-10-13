import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('fixture:sass', function () {
  it('additionalData', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      input: {
        basic: './basic.scss',
      },
      style: {
        sass: {
          additionalData: `$base-color: #c6538c;
            $border-dark: rgba($base-color, 0.88);`,
        },
      },
    });
    await bundler.build();
    bundler.expectCSSOutputMatchSnapshot();
  });
});
