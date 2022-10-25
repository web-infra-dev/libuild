import type CleanCss from 'clean-css';
import type { AcceptedPlugin, ProcessOptions } from 'postcss';
import { Options as sassOptions } from 'sass';

export type PostcssOptions = {
  processOptions?: ProcessOptions;
  plugins?: AcceptedPlugin[];
  autoModules?: boolean | RegExp;
};

export type { sassOptions };

type AdditionalData = string | ((filePath: string) => string);

export interface Style {
  inject?: boolean;
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
