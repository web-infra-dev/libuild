import { defineConfig } from '@modern-js/libuild';

export default defineConfig([
  {
    resolve: {
      alias: {
        '@': 'src',
      },
    },
    clean: true,
    bundle: false,
    input: ['src/bundleless/*'],
    metafile: true,
  },
  {
    input: ['src/bundle/lib.ts'],
    clean: true,
    bundle: true,
    entryNames: '[dir]/[name]',
  },
]);
