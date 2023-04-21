import { defineConfig } from '@modern-js/libuild';
import { swcTransformPlugin } from '@modern-js/libuild-plugin-swc';

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
  {
    resolve: {
      alias: {
        '@': 'src',
      },
    },
    clean: true,
    bundle: false,
    format: 'cjs',
    input: ['src/bundle/*'],
    outdir: './dist/enable-swc-bundleless',
    plugins: [swcTransformPlugin({ externalHelpers: true })],
  },
  {
    input: ['src/bundle/lib.ts'],
    clean: true,
    bundle: true,
    format: 'cjs',
    target: 'es2022',
    outdir: './dist/enable-swc-bundle',
    plugins: [swcTransformPlugin({ externalHelpers: true })],
  },
]);
