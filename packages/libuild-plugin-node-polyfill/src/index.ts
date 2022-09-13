import type { LibuildPlugin } from '@modern-js/libuild';

export interface NodePolyfillPluginOptions {
  excludes?: string[];
}
function filterObject(object: Record<string, string>, filter: (id: string) => boolean) {
  const filtered: Record<string, string> = {};
  Object.keys(object).forEach((key) => {
    if (filter(key)) {
      filtered[key] = object[key];
    }
  });
  return filtered;
}
function excludeObjectKeys(object: Record<string, string>, keys: string[]) {
  return filterObject(object, (key) => !keys.includes(key));
}

export const nodePolyfillPlugin = (options: NodePolyfillPluginOptions): LibuildPlugin => {
  return {
    name: 'libuild:@modern-js/libuild-plugin-node-polyfill',
    apply(compiler) {
      options = {
        excludes: [],
        ...options,
      };
      // plugin logic here
      const polyfillModules = {
        ...excludeObjectKeys(
          {
            assert: require.resolve('assert/'),
            buffer: require.resolve('buffer/'),
            console: require.resolve('console-browserify'),
            constants: require.resolve('constants-browserify'),
            crypto: require.resolve('crypto-browserify'),
            domain: require.resolve('domain-browser'),
            events: require.resolve('events/'),
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify'),
            os: require.resolve('os-browserify/browser'),
            path: require.resolve('path-browserify'),
            punycode: require.resolve('punycode/'),
            process: require.resolve('process/browser'),
            querystring: require.resolve('querystring-es3'),
            stream: require.resolve('stream-browserify'),
            _stream_duplex: require.resolve('readable-stream/lib/_stream_duplex'),
            _stream_passthrough: require.resolve('readable-stream/lib/_stream_passthrough'),
            _stream_readable: require.resolve('readable-stream/lib/_stream_readable'),
            _stream_transform: require.resolve('readable-stream/lib/_stream_transform'),
            _stream_writable: require.resolve('readable-stream/lib/_stream_writable'),
            string_decoder: require.resolve('string_decoder/'),
            sys: require.resolve('util/'),
            timers: require.resolve('timers-browserify'),
            tty: require.resolve('tty-browserify'),
            url: require.resolve('url/'),
            util: require.resolve('util/'),
            vm: require.resolve('vm-browserify'),
            zlib: require.resolve('browserify-zlib'),
          },
          options.excludes ?? []
        ),
      };
      const polyfillModulesKeys = Object.keys(polyfillModules);
      compiler.hooks.resolve.tap('nodePolyfill', (args) => {
        if (polyfillModulesKeys.includes(args.path)) {
          return {
            path: polyfillModules[args.path],
          };
        }
      });
    },
  };
};
