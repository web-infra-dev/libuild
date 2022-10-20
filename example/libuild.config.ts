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
    outdir: 'dist/bundleless',
    sourceDir: 'src/bundleless',
  },
  {
    input: ['src/bundle/lib.ts'],
    clean: true,
    bundle: true,
    outdir: 'dist/bundle',
  },
]);
