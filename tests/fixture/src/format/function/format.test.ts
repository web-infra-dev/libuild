import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('fixture:format:function', () => {
  it('format function', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      format(chunkName: string) {
        if (chunkName.indexOf('index') > -1) {
          return 'cjs';
        }
        return 'esm';
      },
    });
    await bundler.build();

    bundler.expectJSOutputMatchSnapshot();
  });
});
