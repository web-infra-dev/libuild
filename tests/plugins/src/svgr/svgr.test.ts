import { expect, getLibuilderTest } from '@modern-js/libuild-test-toolkit';
import { svgrPlugin } from '@modern-js/libuild-plugin-svgr';

describe('fixture:plugin:svgr', function () {
  it('plugin:svgr', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      input: {
        main: './index.tsx',
      },
      format: 'esm',
      plugins: [svgrPlugin()],
    });
    await bundler.build();

    const jsOutput = Object.values(bundler.getJSOutput());
    expect(jsOutput[0].contents).toMatchSnapshot();
  });
});
