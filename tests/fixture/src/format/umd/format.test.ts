import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';
import { umdPlugin } from '@modern-js/libuild-plugin-umd';

describe('fixture:format:umd', () => {
  it('format umd', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      format: 'umd',
      splitting: true,
      plugins: [umdPlugin()],
    });
    await bundler.build();

    bundler.expectJSOutputMatchSnapshot();
  });
});
