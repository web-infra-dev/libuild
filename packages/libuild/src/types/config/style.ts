import type CleanCss from 'clean-css';
import type { AcceptedPlugin, ProcessOptions } from 'postcss';
import { Options as sassOptions } from 'sass';

export type PostcssOptions = {
  processOptions?: ProcessOptions;
  plugins?: AcceptedPlugin[];
};

export type { sassOptions };

type AdditionalData = string | ((filePath: string) => string);

export interface Style {
  sass?: {
    additionalData?: AdditionalData;
    implementation?: object | string;
    sassOptions?: sassOptions;
  };
  less?: {
    additionalData?: AdditionalData;
    implementation?: object | string;
    lessOptions?: Less.Options;
  };
  postcss?: PostcssOptions;
  cleanCss?: CleanCss.OptionsOutput | boolean;
}
