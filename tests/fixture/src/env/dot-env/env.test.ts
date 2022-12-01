import { getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('fixture:env', () => {
  it('env', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      input: {
        main: './index.ts',
      },
    });
    await bundler.build();
    bundler.expectJSOutputMatchSnapshot();
    delete process.env.NODE_ENV;
  });
});
