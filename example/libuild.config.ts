import { defineConfig } from '@modern-js/libuild';

export default defineConfig({
  input: {
    index: './src/lib.ts',
  },
  target: 'es2020',
  style: {
    less: {
      prependData: `@base-color: #c6538c;
            .a { color: @base-color }`,
    },
    sass: {},
  },
  metafile: true,
  clean: true,
});
