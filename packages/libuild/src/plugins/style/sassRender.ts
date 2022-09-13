import { readFileSync } from 'fs';
import path from 'path';
import { ILibuilder, Style } from '../../types';
import { loadProcessor, rebaseUrls } from './utils';
import { PreprocessRender } from './transformStyle';

export const sassRender: PreprocessRender = async function (
  this: ILibuilder,
  content: string,
  originPath: string,
  stdinDir: string,
  options: Style['sass'],
  resolvePathMap: Map<string, string>
) {
  const sass = await loadProcessor('sass', this.config.root);
  return new Promise((resolve, reject) => {
    sass.render(
      {
        data: content,
        importer: [
          (url: string, dir: string, done: (value: unknown) => void) => {
            if (url.startsWith('data:')) {
              done({
                contents: url,
              });
            }
            let filePath = null;
            const baseUrl = path.basename(url);
            const dirUrl = path.dirname(url);
            const removeUnderScoreBaseUrl = baseUrl.replace(/^_/, '');
            const prependUnderScoreBaseUrl = `_${removeUnderScoreBaseUrl}`;
            try {
              filePath = this.config.css_resolve(
                path.join(dirUrl, prependUnderScoreBaseUrl),
                dir === 'stdin' ? stdinDir : (resolvePathMap.get(dir) as string)
              );
            } catch (err) {
              filePath = this.config.css_resolve(
                path.join(dirUrl, removeUnderScoreBaseUrl),
                dir === 'stdin' ? stdinDir : dir
              );
            }
            resolvePathMap.set(url, path.dirname(filePath));
            if (url.startsWith('./')) {
              resolvePathMap.set(url.replace(/^\.\//, ''), path.dirname(filePath));
            }
            rebaseUrls(filePath, stdinDir, this.config.css_resolve).then((value) => {
              done({
                contents: value.contents || readFileSync(value.file, 'utf-8'),
              });
            });
          },
        ],
        ...options,
      },
      (err: string, res: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
};
