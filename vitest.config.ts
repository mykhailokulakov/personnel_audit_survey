import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.{test,spec}.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      include: ['src/**'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/**/index.ts',
        'src/components/ui/**',
        'src/app/**',
      ],
      provider: 'v8',
      reporter: ['text', 'json-summary', 'json'],
      thresholds: {
        'src/lib/**': {
          lines: 80,
          statements: 80,
          functions: 80,
          branches: 80,
        },
        'src/components/**': {
          lines: 75,
          statements: 75,
          functions: 70,
          branches: 75,
        },
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 75,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
