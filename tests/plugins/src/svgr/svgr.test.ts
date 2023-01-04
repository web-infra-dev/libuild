import { expect, getLibuilderTest } from '@modern-js/libuild-test-toolkit';
import { svgrPlugin } from '@modern-js/libuild-plugin-svgr';

describe('fixture:plugin:svgr', function () {
  it('bundle', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      input: {
        bundle: './index.ts',
      },
      plugins: [svgrPlugin()],
      external: [new RegExp(`^react($|\\/|\\\\)`)]
    });
    await bundler.build();

    const jsOutput = Object.values(bundler.getJSOutput());
    expect(jsOutput[0].contents).toMatchSnapshot();
  });

  it('no bundle', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      bundle: false,
      input: {
        bundleless: './index.ts',
      },
      format: 'esm',
      plugins: [svgrPlugin()],
      external: [new RegExp(`^react($|\\/|\\\\)`)],
      outbase: '.',
    });
    await bundler.build();

    const jsOutput = Object.values(bundler.getJSOutput());
    expect(jsOutput.length === 2).to.be.true;
  });
});
