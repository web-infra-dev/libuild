import type CleanCss from 'clean-css';
import type { AcceptedPlugin, ProcessOptions } from 'postcss';
import { Options as sassOptions } from 'sass';

export type PostcssOptions = {
  processOptions?: ProcessOptions;
  plugins?: AcceptedPlugin[];
};

export type { sassOptions };

type PrependData = string | ((filePath: string) => string);

export interface Style {
  sass?: sassOptions & {
    prependData?: PrependData;
  };
  scss?: sassOptions & {
    prependData?: PrependData;
  };
  less?: Less.Options & {
    prependData?: PrependData;
  };
  postcss?: PostcssOptions;
  cleanCss?: CleanCss.OptionsOutput | boolean;
}
