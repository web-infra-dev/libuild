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
  },
  {
    input: ['src/bundle/lib.ts'],
    clean: true,
    bundle: true,
  },
]);
