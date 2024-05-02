import { resolve } from 'node:path';
import type { UserConfig } from 'vitest/config';

type Entry = [string, string];

type TsConf = {
  compilerOptions?: {
    paths?: Record<string, string[]>;
    baseUrl?: string;
  };
};

type Plugin = Exclude<UserConfig['plugins'], undefined>[number];

const configPaths = (arg: string) => {
  return arg.replace('/*', '');
};

const checkBaseUrl = (url: any): url is string => {
  return url && url !== '.' && url !== './';
};

const transformer = (baseUrl?: string) => {
  return ([_key, _value]: Entry) => {
    const key = configPaths(_key);
    const lastPath = configPaths(_value);
    const cwd = process.cwd();
    const base = checkBaseUrl(baseUrl);

    const args = base ? [cwd, baseUrl, lastPath] : [cwd, lastPath];
    const value = resolve(...args);

    return [key, value] as Entry;
  };
};

/**
 * Add manually your alias with this function
 * @param tsconfig The tsconfig json
 * @returns a vitest config
 *
 * @example
 * <code>
 * {
 *   test: {
 *     alias: createAlias(tsconfig),
 *   }
 * }
 *</code>
 */
export const createAlias = (tsconfig?: TsConf) => {
  const paths = tsconfig?.compilerOptions?.paths;
  if (!paths) return {};
  const entries = Object.entries(paths);
  const array = entries.map(([key, [value]]) => {
    return [key, value];
  }) as Entry[];

  const baseUrl = tsconfig?.compilerOptions?.baseUrl;
  const transformedArray = array.map(transformer(baseUrl));
  const object = Object.fromEntries(transformedArray);

  return object;
};

/**
 * Plugin to add alias from tsconfig to test.alias
 *
 * @param tsconfig The tsconfig json
 * @returns a vitest config
 *
 * @remarks
 * Make sure you add "resolveJsonModule": true
 * inside your tsconfig.json at compilerOPtions
 * or add the json directly
 */
export const aliasTs = (tsconfig?: TsConf): Plugin => ({
  name: 'aliasTs',
  enforce: 'pre',
  config: options => {
    const testConfig = options?.test;
    const alias = createAlias(tsconfig);

    return {
      ...options,
      test: {
        ...testConfig,
        alias,
      },
    };
  },
});
