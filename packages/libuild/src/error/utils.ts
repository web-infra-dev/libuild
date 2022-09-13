import chalk from 'chalk';
import util from 'util';
import stripAnsi from 'strip-ansi';
import { parse as stackParse } from 'stack-trace';
import {
  LibuildErrorInstance,
  LibuildErrorsData,
  LogLevel,
  ErrorLevel,
  EsbuildError,
  LibuildErrorParams,
} from '../types';
import { LibuildError } from './error';
import { ErrorCode } from '../constants/error';
import type { IConfigLoaderMessage } from '../types';

/**
 * we can't use instanceof LibuildError, because it may not be an singleton class
 * @param err
 * @returns
 */
export function isLibuildErrorInstance(err: unknown): err is LibuildError {
  return err instanceof Error && err.constructor.name === LibuildError.name;
}

export function formatError(err: Error | LibuildErrorInstance) {
  const msgs: string[] = [];
  /**
   * do not show stack for LibuildError by default, which is not useful for user
   */
  if (isLibuildErrorInstance(err)) {
    msgs.push(err.toString());
  } else if (err instanceof Error) {
    if (err.stack) {
      msgs.push(err.stack);
    } else {
      msgs.push(chalk.red(err.message));
    }
  } else {
    msgs.push(util.inspect(err));
  }
  return msgs.join('\n');
}

export function ConfigLoaderMesaageToLibuildError({ message, location }: IConfigLoaderMessage, isError = true) {
  const code = isError ? ErrorCode.CONFIG_TRANSFORM_FAILED : ErrorCode.CONFIG_TRANSFORM_WARN;
  const level = isError ? 'Error' : 'Warn';

  if (!location) {
    return new LibuildError(code, message, {
      level,
    });
  }

  return new LibuildError(code, message, {
    level,
    codeFrame: {
      filePath: location.file,
      fileContent: location.source,
      start: {
        line: location.line ?? -1,
        column: location.column ?? -1,
      },
    },
  });
}

export function toLevel(level: keyof typeof ErrorLevel) {
  return ErrorLevel[level];
}

export function insertSpace(rawLines: string, line: number, width: number) {
  const lines = rawLines.split('\n');
  lines[line - 1] = Array(width).fill(' ').join('') + lines[line - 1];
  return lines.join('\n');
}

export function printErrors({ errors, warnings }: LibuildErrorsData, logLevel: LogLevel = 'error') {
  const onlyError = logLevel === 'error';

  if (logLevel === 'silent') {
    return '';
  }

  if ((onlyError && errors.length === 0) || (!onlyError && errors.length === 0 && warnings.length === 0)) {
    return '';
  }

  const msgs: string[] = [];

  if (onlyError) {
    msgs.push(`Build failed with ${errors.length} error:`, ...errors.map((item) => item.toString()), '');
  } else {
    const title =
      errors.length === 0
        ? `Build succuss with ${warnings.length} warning:`
        : `Build failed with ${errors.length} error, ${warnings.length} warning:`;

    msgs.push(title, ...errors.map((item) => item.toString()), ...warnings.map((item) => item.toString()), '');
  }

  return msgs.join('\n\n');
}

export function warpErrors(errors: LibuildError[], logLevel: LogLevel = 'error'): LibuildErrorsData {
  const data: LibuildErrorsData = {
    errors: errors.filter((item) => item.level === 'Error'),
    warnings: errors.filter((item) => item.level === 'Warn'),
  };

  data.toString = () => printErrors(data, logLevel);

  return data;
}

function isEsbuildError(err: any): err is EsbuildError {
  return 'pluginName' in err && 'text' in err && 'location' in err;
}

function clearMessage(str: string) {
  return stripAnsi(str).replace(/.*: (.*)\n\n[\s\S]*/g, '$1');
}

function clearStack(str: string) {
  return str.slice(str.indexOf('  at')).replace(/\s*at(.*) \((.*)\)/g, '$1\n$2\n');
}

function transformEsbuildError(err: any, opt?: LibuildErrorParams) {
  if (isEsbuildError(err)) {
    const errorCode = opt?.code ?? 'ESBUILD_ERROR';
    const libuildError =
      typeof err.detail === 'object'
        ? LibuildError.from(err.detail)
        : new LibuildError(errorCode, clearMessage(err.text), {
            ...opt,
            hint: err.location?.suggestion,
            codeFrame: {
              filePath: err.text.split(':')[0],
            },
          });

    if (err.location) {
      libuildError.setCodeFrame({
        filePath: err.location.file,
        lineText: err.location.lineText,
        length: err.location.length,
        start: {
          line: err.location.line,
          column: err.location.column + 1,
        },
      });
    }

    return libuildError;
  }
}

function transformNormalError(err: any, opt?: LibuildErrorParams) {
  if (err instanceof Error) {
    const stacks = stackParse(err);
    return new LibuildError(err.name, clearMessage(err.message), {
      ...opt,
      codeFrame: {
        filePath: stacks[0].getFileName(),
      },
      stack: err.stack && clearStack(err.stack),
    });
  }
}

function defaultError(err: any, opt?: LibuildErrorParams) {
  return new LibuildError('UNKNOWN_ERROR', JSON.stringify(err), opt);
}

export function transform(err: any, opt?: LibuildErrorParams) {
  const transformers = [transformEsbuildError, transformNormalError];

  for (const fn of transformers) {
    const result = fn(err, opt);

    if (result) {
      return result;
    }
  }

  return defaultError(err, opt);
}
