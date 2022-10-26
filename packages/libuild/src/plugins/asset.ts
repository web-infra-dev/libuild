import path, { relative } from 'path';
import fs from 'fs';
import { createHash } from 'crypto';
import { resolvePathAndQuery } from '@modern-js/libuild-utils';
import { LibuildPlugin, ILibuilder, Asset } from '../types';

const IMAGE_REGEXP = /\.png$|\.jpe?g$|\.gif$|\.webp$/;
export const assetExt = [
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ttf',
  '.otf',
  '.woff',
  '.woff2',
  '.eot',
  '.mp3',
  '.mp4',
  '.webm',
  '.ogg',
  '.wav',
  '.flac',
  '.aac',
  '.mov',
];
export const assetsPlugin = (): LibuildPlugin => {
  const pluginName = 'libuild:asset';
  return {
    name: pluginName,
    apply(compiler) {
      compiler.hooks.load.tapPromise(pluginName, async (args) => {
        if (assetExt.find((ext) => ext === path.extname(args.path))) {
          const { originalFilePath } = resolvePathAndQuery(args.path);
          const contents = await getAssetContents.apply(compiler, [originalFilePath]);
          return {
            contents,
            loader: 'text',
          };
        }
      });
    },
  };
};

// https://github.com/filamentgroup/directory-encoder/blob/master/lib/svg-uri-encoder.js
function encodeSVG(buffer: Buffer) {
  return (
    encodeURIComponent(
      buffer
        .toString('utf-8')
        // strip newlines and tabs
        .replace(/[\n\r]/gim, '')
        .replace(/\t/gim, ' ')
        // strip comments
        .replace(/<!--(.*(?=-->))-->/gim, '')
        // replace
        .replace(/'/gim, '\\i')
    )
      // encode brackets
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
  );
}

/**
 *
 * @param this Compiler
 * @param assetPath Absolute path of the asset
 * @param rebaseFrom Absolute path of the file which import asset
 * @returns dataurl or path
 */
export async function getAssetContents(this: ILibuilder, assetPath: string, rebaseFrom?: string) {
  const DEFAULT_INLINE_LIMIT = 0;
  const fileContent = await fs.promises.readFile(assetPath);
  const limit = this.config.asset.limit ?? DEFAULT_INLINE_LIMIT;
  const outdir = this.config.asset.outdir ?? 'assets';
  const rebase = this.config.asset.rebase ?? !this.config.bundle;
  const assetName = this.config.asset.name ?? '[name].[hash].[ext]';
  const publicPath = this.config.asset.publicPath ?? '';
  if (fileContent.length < limit && !rebase) {
    // inline base64
    const mimetype = (await import('mime-types')).default.lookup(assetPath);
    const isSVG = mimetype === 'image/svg+xml';
    const data = isSVG ? encodeSVG(fileContent) : fileContent.toString('base64');
    const encoding = isSVG ? '' : ';base64';
    return `data:${mimetype}${encoding},${data}`;
  }
  const outputFileName = getOutputFileName(assetPath, fileContent, assetName);
  const outputFilePath = path.join(this.config.outdir, outdir, outputFileName);
  this.emitAsset(outputFilePath, {
    type: 'asset',
    fileName: outputFilePath,
    contents: fileContent,
    originalFileName: assetPath,
  });
  if (rebaseFrom && rebase) {
    const relativePath = relative(rebaseFrom, outputFilePath);
    return relativePath;
  }
  const filePath = `${
    typeof publicPath === 'function' ? publicPath(assetPath) : publicPath
  }${outdir}/${outputFileName}`;
  return filePath;
}

export function getOutputFileName(filePath: string, content: Buffer, assetName: Required<Asset['name']>): string {
  const format = typeof assetName === 'function' ? assetName(filePath) : assetName;
  const fileBaseNameArray = path.basename(filePath).split('.');
  const extname = fileBaseNameArray.pop();
  const fileBaseName = fileBaseNameArray.join('.');
  const outputFileName = format.replace(/(\[[^\]]*\])/g, (str: string, match: string): string => {
    if (match === '[name]') {
      return fileBaseName;
    }
    if (match === '[ext]') {
      return extname as string;
    }
    if (match === '[hash]' || match === '[contenthash]') {
      return getHash(content, null).slice(0, 8);
    }
    return match;
  });

  return outputFileName;
}

export function getHash(content: Buffer | string, encoding: any, type = 'md5'): string {
  return createHash(type).update(content.toString(), encoding).digest('hex');
}
