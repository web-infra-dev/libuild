import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';
import { es5InputPlugin } from '@modern-js/libuild-plugin-es5';

describe('fixture:es5', function () {
  it('es5-input-polyfill', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      target: 'es5',
      plugins: [es5InputPlugin({ polyfill: true })],
    });
    await bundler.build();
    bundler.expectJSOutputMatchSnapshot();
  });
});
