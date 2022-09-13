import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';
import { es5OutputPlugin } from '@modern-js/libuild-plugin-es5';

describe('fixture:es5', () => {
  it('es5-output', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      target: 'es6',
      plugins: [es5OutputPlugin()],
    });
    await bundler.build();
    bundler.expectJSOutputMatchSnapshot();
  });
});
