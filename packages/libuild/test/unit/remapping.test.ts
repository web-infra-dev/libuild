import assert from 'assert';
import { mergeSourcemaps } from '../../src/utils';

const original = {
  version: 3,
  sources: ['source.ts'],
  names: [],
  mappings: 'AAAA,qC,aACA',
  sourcesContent: ["function say(msg) {console.log(msg)};say('hello');\nprocess.exit(1);"],
};
const minified = {
  version: 3,
  sources: ['source.js'],
  names: ['say', 'msg', 'console', 'log', 'process', 'exit'],
  mappings: 'AAAA,SAASA,IAAIC,GAAMC,QAAQC,IAAIF,GAAMD,IAAI,SAASI,QAAQC,KAAK',
};

// This test only guarantees the call with different
// parameters, not the correctness of the function.
describe('remapping count test', () => {
  it('call native', async () => {
    const { count } = await mergeSourcemaps([minified, original], { native: true });
    assert(count.native === 1);
    assert(count.js === 0);
  });

  it('call js', async () => {
    const { count } = await mergeSourcemaps([minified, original], { native: false });
    assert(count.native === 0);
    assert(count.js === 1);
  });

  it('call native but encounter error', async () => {
    try {
      // @ts-ignore
      // It will makes the native remapping failed.
      // And then it will execute `catch` block.
      await mergeSourcemaps('', { native: true });
    } catch (err: any) {
      // Make sure the error comes from `ampremapping`.
      assert(err.message.includes('Unexpected end of JSON input'));
    }
  });
});
