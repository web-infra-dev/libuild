import { expect, getLibuilderTest } from '@modern-js/libuild-test-toolkit';
import { transformPlugin } from '@modern-js/libuild-plugin-swc';

describe('fixture:plugin:swc', function () {
  it('plugin:swc', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      input: ['./index.tsx'],
      plugins: [
        transformPlugin({
          jsc: {
            transform: {
              legacyDecorator: true,
              decoratorMetadata: true,
              react: {
                runtime: 'classic',
              }
            }
          }
        }),
      ],
      external: ['react'],
    });
    await bundler.build();

    const jsOutput = Object.values(bundler.getJSOutput());
    expect(jsOutput[0].contents).toMatchSnapshot();
  });
});
