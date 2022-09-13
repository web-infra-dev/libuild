import { defineConfig } from '@modern-js/libuild-test-toolkit';

export = defineConfig([
  {
    input: {
      main: './main.ts',
    },
  },
  {
    input: {
      other: './other.ts',
    },
  },
]);
