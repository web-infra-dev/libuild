# @modern-js/libuild-plugin-es5
[![npm version](https://badge.fury.io/js/@modern-js%2Flibuild-plugin-es5.svg)](https://www.npmjs.com/package/@modern-js/libuild-plugin-es5)

A plugin for libuild to transform your code to es5.

## Usage

```ts
// libuild.config.ts
import { defineConfig } from '@modern-js/libuild';
import { es5Plugin } from '@modern-js/libuild-plugin-es5';

export = defineConfig({
  plugins:[
    es5Plugin()
  ]
})
```
