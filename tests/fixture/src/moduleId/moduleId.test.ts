import { expect, getLibuilderTest } from '@modern-js/libuild-test-toolkit';

describe('fixture:moduleId', function () {
  it('change moduleId', async () => {
    const bundler = await getLibuilderTest({
      root: __dirname,
      format: 'umd',
      getModuleId: () => {
        return 'example';
      },
    });
    await bundler.build();
    const jsChunk = Object.values(bundler.getJSOutput());
    expect(jsChunk.length === 1).to.true;
    expect(jsChunk[0].contents.includes('global.example')).to.true;
  });
});
