import fs from 'fs';
import path from 'path';
import env from 'dotenv';
import envExpand from 'dotenv-expand';
import { version } from 'process';
import semver from 'semver';
import { DEFAULT_NODE_ENV } from '../constants/config';

interface SupportedLibuildEnv {
  name: LibuildEnvName;
  default: string;
}

export const LibuildEnv = {
  NODE_ENV: 'NODE_ENV',
  LIBUILD_ENV_DEBUG: 'LIBUILD_ENV_DEBUG',
  // Turning this on is equivalent to enabling all of the native functions as which are used to speed up libuild. But still you can turn off them individually.
  LIBUILD_NATIVE: 'LIBUILD_NATIVE',
} as const;

export type LibuildEnvName = keyof typeof LibuildEnv;

const debugging = process.env[LibuildEnv.LIBUILD_ENV_DEBUG] === 'true';

export const loadEnv = (projectRoot?: string): void => {
  const NODE_ENV = process.env.NODE_ENV || DEFAULT_NODE_ENV;

  const currProjectRoot = projectRoot ?? process.cwd();

  if (!NODE_ENV) {
    throw new Error('The NODE_ENV environment variable is required but was not specified.');
  }

  const envFile = path.join(currProjectRoot, '.env');

  const dotenvFiles = [`${envFile}.${NODE_ENV}.local`, `${envFile}.local`, `${envFile}.${NODE_ENV}`, envFile];

  dotenvFiles.forEach((dotenvFile) => {
    if (fs.existsSync(dotenvFile)) {
      envExpand(
        env.config({
          path: dotenvFile,
          debug: debugging,
        })
      );
    }
  });
};
export const getClientEnvironment = (projectRoot?: string) => {
  if (projectRoot) {
    loadEnv(projectRoot);
  }

  // See: https://github.com/nodejs/node/issues/37236
  const supportNapiClassRef = semver.satisfies(version, '>=14.17.0');
  const LIBUILD_ENV = /^LIBUILD_/i;
  const defaultLibuildNativeEnabled =
    process.env.LIBUILD_NATIVE === undefined ? supportNapiClassRef : process.env.LIBUILD_NATIVE === 'true';

  const SUPPORTED_LIBUILD_ENVS: SupportedLibuildEnv[] = [
    {
      name: LibuildEnv.LIBUILD_ENV_DEBUG,
      default: 'false',
    },
    {
      name: LibuildEnv.LIBUILD_NATIVE,
      default: String(defaultLibuildNativeEnabled),
    },
  ];

  const raw = Object.keys(process.env)
    .filter((key) => {
      return LIBUILD_ENV.test(key);
    })
    .reduce(
      (env, key) => {
        env[key as LibuildEnvName] = process.env[key]!;
        return env;
      },
      {
        ...SUPPORTED_LIBUILD_ENVS.reduce((acc, env) => {
          const { name: envName, default: defaultValue } = env;
          acc[envName] = process.env[envName] ?? defaultValue;
          return acc;
        }, {} as Record<LibuildEnvName, string>),
        NODE_ENV: process.env.NODE_ENV || DEFAULT_NODE_ENV,
      } as Record<LibuildEnvName, string>
    );

  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key as LibuildEnvName]);
      return env;
    }, {} as Record<string, string>),
  };

  return { raw, stringified };
};
