import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('fixture:postcss:config-file', () => {
  it('should load config from external config file', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      input: {
        index: './index.css',
      },
    });
    await bundler.build();
    bundler.expectCSSOutputMatchSnapshot();
  });
});
