import path from 'path';
import { Plugin } from 'postcss';
import { ILibuilder } from '../../types';
import { rewriteCssUrls } from './utils';
import { getAssetContents } from '../asset';

const Processed = Symbol('processed');
const HTTP_PATTERNS = /^(https?:)?\/\//;
const DATAURL_PATTERNS = /^data:/;
const HASH_PATTERNS = /#[^#]+$/;

export const postcssUrlPlugin = (options: { entryPath: string; compilation: ILibuilder }) => {
  options = options || ({} as any);

  return {
    postcssPlugin: 'speedy-postcss-url',
    async Declaration(decl) {
      const isProcessed = (decl as any)[Processed];

      decl.value = await rewriteCssUrls(decl.value, false, async (URL: string) => {
        if (
          URL &&
          !HTTP_PATTERNS.test(URL) &&
          !HASH_PATTERNS.test(URL) &&
          !DATAURL_PATTERNS.test(URL) &&
          !isProcessed
        ) {
          let filePath = URL;
          filePath = options.compilation.config.css_resolve(URL, path.dirname(options.entryPath));
          const fileUrl =  await getAssetContents.apply(options.compilation, [filePath]);

          (decl as any)[Processed] = true;
          return fileUrl
        }
        return URL;
      });
    },
  } as Plugin;
};