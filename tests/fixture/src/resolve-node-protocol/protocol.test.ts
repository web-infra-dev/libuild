import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('fixture:resolve-node-protocol', () => {
  it('default', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      platform: 'node',
      bundle: true,
    });
    await bundler.build();
    bundler.expectJSOutputMatchSnapshot();
  });
});
