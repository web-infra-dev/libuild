# Libuild
[![npm version](https://badge.fury.io/js/@modern-js%2Flibuild.svg)](https://www.npmjs.com/package/@modern-js/libuild)

A tool for building modern JavaScript library.

## Why is Libuild
- You can use libuild to build your libraries with no config, or add cli options or use file configuration `libuild.config.ts` to set your build options.
- Libuild is the optimal balance of stability and speed.
- Libuild implemented an adapter plugin for esbuild. In theory, it can inherit all the abilities of esbuild, and on the basis of that, we integrate the capabilities which are needed to build libraries, like style and asset support. We've got a set of best practices for you.

## Usage
Install libuild in your project
```bash
npm install --dev @modern-js/libuild
```
Then build your project with libuild
```bash
libuild
```

You can add cli options or use file configuration `libuild.config.ts` to set your build options.
This is a [example](../../example), and see config [here](./src/types/config/index.ts).

## License

[MIT](./LICENSE.md)