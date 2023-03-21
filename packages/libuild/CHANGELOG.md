# Change Log - @modern-js/libuild

This log was last generated on Tue, 21 Mar 2023 07:44:54 GMT and should not be manually modified.

## 0.11.6
Tue, 21 Mar 2023 07:44:54 GMT

### Updates

- remove browser fields from default mainFields

## 0.11.5
Mon, 13 Mar 2023 12:43:34 GMT

### Updates

- support getJSON in postcss-modules

## 0.11.4
Fri, 10 Mar 2023 15:19:49 GMT

_Version update only_

## 0.11.3
Wed, 08 Mar 2023 04:56:23 GMT

### Updates

- fix resolve sideEffects logic

## 0.11.2
Fri, 24 Feb 2023 07:18:39 GMT

### Updates

- fix: copy json when bundle is false

## 0.11.1
Thu, 23 Feb 2023 12:02:24 GMT

### Updates

- fix: remove file from input when unlink

## 0.11.0
Fri, 17 Feb 2023 08:36:10 GMT

### Updates

- chore: update esbuild version to 0.17.7

## 0.10.1
Mon, 13 Feb 2023 06:20:23 GMT

### Updates

- fix: fix handleWatch in watch mode when bundle is false

## 0.10.0
Wed, 08 Feb 2023 11:09:00 GMT

### Updates

- support sideEffects config

## 0.9.2
Wed, 01 Feb 2023 02:52:09 GMT

_Version update only_

## 0.9.1
Tue, 31 Jan 2023 09:51:30 GMT

### Updates

- fix minify target will be broken by es5 plugin

## 0.9.0
Mon, 16 Jan 2023 08:35:04 GMT

### Updates

- add logic which is ignore d.ts files
- remove less visitor plugin to fix less circular reference which will break less render
- fix redirect error, no redirect file which is dep

## 0.8.0
Thu, 05 Jan 2023 02:12:37 GMT

_Version update only_

## 0.7.6
Wed, 04 Jan 2023 13:09:40 GMT

### Updates

- refactor asset, support svgr in bundleless

## 0.7.5
Tue, 03 Jan 2023 03:12:59 GMT

### Updates

- keep the import about asset to let webpack can resolve by default, but it can be changed by rebase.

## 0.7.4
Tue, 27 Dec 2022 13:42:04 GMT

### Updates

- replace css module filename, use '_' to replace '.'

## 0.7.3
Wed, 21 Dec 2022 07:52:26 GMT

### Updates

- fix alias in bundleless

## 0.7.2
Sun, 18 Dec 2022 13:57:57 GMT

### Updates

- update @ast-grep/napi version to support win32

## 0.7.1
Wed, 14 Dec 2022 08:51:29 GMT

_Version update only_

## 0.7.0
Wed, 14 Dec 2022 05:15:41 GMT

### Updates

- remove esbulild transform, only invoke esbuild build once, and use sucrase transform chunk to cjs

## 0.6.1
Fri, 09 Dec 2022 08:39:53 GMT

_Version update only_

## 0.6.0
Tue, 06 Dec 2022 14:39:31 GMT

### Updates

- use libuild-plugin-swc to support umd and es5 instead.
- fix dynamic import expression not converted to require when using cjs and no-bundle

## 0.5.2
Thu, 01 Dec 2022 12:12:33 GMT

### Updates

- remove process.env.NODE_ENV default value

## 0.5.1
Thu, 01 Dec 2022 08:58:38 GMT

### Updates

- fix redirect path when moduleName is undefined

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

