import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('data-url', () => {
  it('import', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
    });
    await bundler.build();
    bundler.expectJSOutputMatchSnapshot();
  });
});
