import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('resolve:condition mainFields', () => {
  it('basic', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      resolve: {
        mainFields: ['source', 'module', 'browser', 'main'],
      },
    });
    await bundler.build();
    bundler.expectJSOutputMatchSnapshot();
  });
});
