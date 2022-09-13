import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';
import { es5InputPlugin } from '@modern-js/libuild-plugin-es5';

describe('fixture:es5', () => {
  it('es5-input', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      input: {
        ts: './index.ts',
        js: './index.js',
        tsx: './index.tsx',
        jsx: './index.jsx',
      },
      target: 'es5',
      plugins: [es5InputPlugin()],
    });
    await bundler.build();
    bundler.expectJSOutputMatchSnapshot();
  });
});
