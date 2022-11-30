# Change Log - @modern-js/libuild

This log was last generated on Wed, 30 Nov 2022 09:08:41 GMT and should not be manually modified.

## 0.5.0
Wed, 30 Nov 2022 09:08:41 GMT

### Updates

- fix asset relative path in win32
- fix sass resolve error
- support autoExternal

## 0.4.0
Mon, 14 Nov 2022 06:16:02 GMT

### Updates

- remove the built-in babel and support umd format through @modern-js/libuild-pluign-umd

## 0.3.0
Thu, 03 Nov 2022 07:55:22 GMT

### Minor changes

- support autoModules and style inject
-  support outbase and deprecated sourceDir, to improve build when bundle is false
- support postcss-modules option

### Patches

- refactor error thrown by libuilder
- improve redirect plugin and rebase logic
- add `await` for style compile
- remove native remapping
- adjust watch log
- add cli option --source-dir
- add log about esbuild warn and change error code

## 0.2.0
Thu, 13 Oct 2022 12:46:42 GMT

### Minor changes

- support less and sass custom implementation and adjust less and sass properties

## 0.1.3
Wed, 12 Oct 2022 03:51:07 GMT

### Patches

- support --bundle
- add esbuildOptions
- support all assets can inline and limit
- improve support for bundleless
- fix redirect assets path

## 0.1.2
Mon, 26 Sep 2022 03:44:18 GMT

### Patches

- support getModuleId for umd
- support more cli options

## 0.1.1
Tue, 20 Sep 2022 08:24:02 GMT

### Patches

- upgrade tsconfig-paths-webpack-plugin to 4.0.0,upgrade terser to 5.15.0 and remove unuse export
- fix iife format support
- upgrade esbuild to 0.15.1 to support jsx automatic

