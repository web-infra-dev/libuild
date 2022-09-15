# @modern-js/libuild-plugin-es5
[![npm version](https://badge.fury.io/js/@modern-js%2Flibuild-plugin-es5.svg)](https://www.npmjs.com/package/@modern-js/libuild-plugin-es5)

A plugin for libuild to transform your code to es5.

`es5InputPlugin` will transform your code before bundle, and built-in `core-js` polyfill support, enable it by config.
`es5OutputPlugin` will transform your code after bundle, it will set esbuild target to `es2015`.

## Usage

```ts
// libuild.config.ts
import { defineConfig } from '@modern-js/libuild';
import { es5InputPlugin } from '@modern-js/libuild-plugin-es5';

export = defineConfig({
  plugins:[
    es5InputPlugin({
      polyfill: true, /* core-js polyfill */
    })
  ]
})
```

## es5InputPlugin Options

### polyfill
Whether to inject core-js polyfill, default is `false`