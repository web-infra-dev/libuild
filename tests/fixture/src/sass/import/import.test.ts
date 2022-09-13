import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('fixture:sass', function () {
  it('@import should work', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      input: {
        import: './import.scss',
      },
    });
    await bundler.build();
    bundler.expectCSSOutputMatchSnapshot();
  });
});
