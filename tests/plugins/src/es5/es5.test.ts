import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';
import { es5Plugin } from '@modern-js/libuild-plugin-es5';

describe('fixture:es5', () => {
  it('es5', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      plugins: [es5Plugin()],
    });
    await bundler.build();
    bundler.expectJSOutputMatchSnapshot();
  });
});
