import { LibuildPlugin, ILibuilder, Asset } from '../types';
import path from 'path';
import { promises as fs } from 'fs';
import { createHash } from 'crypto';
import { resolvePathAndQuery } from '@modern-js/libuild-utils'
const IMAGE_REGEXP = /\.png$|\.jpe?g$|\.gif$|\.webp$/;
const assetExt = ['.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ttf', '.otf', '.woff', '.woff2', '.eot', '.mp3', '.mp4', '.webm', '.ogg', '.wav', '.flac', '.aac', '.mov'];
export const assetsPlugin = (): LibuildPlugin => {
  const pluginName = 'libuild:asset';
  return {
    name: pluginName,
    apply(compiler) {
      compiler.hooks.load.tapPromise(pluginName, async (args) => {
        if (assetExt.find(ext => ext === path.extname(args.path))) {
          const { originalFilePath } = resolvePathAndQuery(args.path)
          const contents = await getAssetContents.apply(compiler, [originalFilePath])
          return {
            contents,
            loader: 'text'
          }
        }
      });
    },
  };
};

export async function getAssetContents(this: ILibuilder, assetPath: string) {
  const DEFAULT_INLINE_LIMIT = 0;
  const fileContent = await fs.readFile(assetPath);
  const limit = this.config.asset.limit ?? DEFAULT_INLINE_LIMIT;
  const assetName = this.config.asset.name ?? 'assets/[name].[hash].[ext]';
  const publicPath = this.config.asset.publicPath ?? '';
  if (IMAGE_REGEXP.test(assetPath) && fileContent.length < limit) {
    // image inline base64
    const contents = `data:${(await import('mime-types')).default.lookup(assetPath)};base64,${(
      fileContent
    ).toString('base64')}`
    return contents
  } else {
    const outputFileName = getOutputFileName(assetPath, fileContent, assetName);
    const outputFilePath = path.resolve(this.config.outdir, outputFileName);
    await this.emitAsset(outputFilePath, {
      type: 'asset',
      fileName: outputFilePath,
      contents: fileContent,
      originalFileName: assetPath,
    });
    const filePath = (typeof publicPath === 'function' ? publicPath(assetPath) : publicPath) + outputFileName;
    return filePath;
  }
}

export function getOutputFileName(
  filePath: string,
  content: Buffer,
  assetName: Required<Asset['name']>
): string {
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