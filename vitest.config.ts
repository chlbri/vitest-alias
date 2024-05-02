import {} from 'vitest';
import { defineConfig } from 'vitest/config';
import { aliasTs } from './src/vitest';
import tsconfig from './tsconfig.json';

export default defineConfig({
  plugins: [aliasTs(tsconfig)],
  test: {
    environment: 'node',
    globals: true,

    coverage: {
      enabled: true,
      extension: 'ts',
      reportsDirectory: '.coverage',
      all: true,
      exclude: ['**/types.ts', '**/index.ts'],
      provider: 'v8',
    },
  },
});
