import path from 'path';
import { PartialMessage } from 'esbuild';
import { resolvePathAndQuery } from '@modern-js/libuild-utils';
import { ILibuilder, Source } from '../../types';
import { LibuildError } from '../../error';
import { postcssTransformer } from './postcssTransformer';
import { lessRender } from './lessRender';
import { sassRender } from './sassRender';

const cssLangs = `\\.(css|less|sass|scss|styl|stylus|pcss|postcss)($|\\?)`;
const cssLangRE = new RegExp(cssLangs);

const cssRender: PreprocessRender = async function (this: ILibuilder, content: string) {
  return {
    css: content,
  };
};
export interface PreprocessRender {
  (
    content: string,
    stdinPath: string,
    stdinDir: string,
    preprocessOptions: any,
    resolvePathMap: Map<string, string>
  ): Promise<{
    css: Buffer | String;
    errors?: PartialMessage[];
    warnings?: PartialMessage[];
    map?: Buffer | string;
  }>;
}

const renderMap: Record<string, Function> = {
  less: lessRender,
  sass: sassRender,
  scss: sassRender,
  css: cssRender,
};
export async function transformStyle(this: ILibuilder, source: Source) {
  const lang = source.path.match(cssLangRE)?.[1];
  if (!lang) {
    throw new LibuildError('UNSUPPORTED_CSS_LANG', `not supported css lang${lang}`);
  }
  const options = this.config.style[lang as 'less' | 'sass' | 'scss'];
  const preprocessRender = renderMap[lang];
  const { originalFilePath } = resolvePathAndQuery(source.path);
  const stdinDir = path.dirname(originalFilePath);

  const resolvePathMap = new Map<string, string>();
  let content = '';
  if (typeof options?.prependData === 'string') {
    content = `${options.prependData}\n`;
  } else if (typeof options?.prependData === 'function') {
    content = `${options.prependData(originalFilePath)}\n`;
  }
  content += source.code;

  const renderResult = await preprocessRender.apply(this, [
    content,
    originalFilePath,
    stdinDir,
    options,
    resolvePathMap,
  ]);
  const css = renderResult.css.toString();
  const { css: cssResult, modules } = await postcssTransformer(css ?? '', originalFilePath, this);
  return {
    contents: cssResult,
    modules,
  };
}
