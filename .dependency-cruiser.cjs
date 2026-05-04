/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are forbidden',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'Orphan modules should be removed',
      from: {
        orphan: true,
        pathNot: [
          '\\.(d\\.ts|test\\.tsx?|spec\\.tsx?)$',
          '^\\..*',
          'tsconfig\\.json$',
          'next\\.config\\.',
          'tailwind\\.config\\.',
          'postcss\\.config\\.',
          'vitest\\.config\\.',
          'playwright\\.config\\.',
          'commitlint\\.config\\.',
          '\\.dependency-cruiser\\.',
          // Intentional stubs/contracts awaiting backend wiring
          'src/lib/storage/persistence\\.ts$',
          // UI primitives prepared for future use (shadcn/base-ui components)
          'src/components/ui/(dialog|select|separator|textarea)\\.tsx$',
          // Placeholder component for not-yet-implemented survey blocks
          'src/components/survey/BlockPlaceholder\\.tsx$',
        ],
      },
      to: {},
    },
    {
      name: 'components-cannot-import-app',
      severity: 'error',
      comment: 'Components layer must not import from app layer',
      from: {
        path: '^src/components',
      },
      to: {
        path: '^src/app',
      },
    },
    {
      name: 'lib-must-be-pure',
      severity: 'error',
      comment: 'lib layer must not import from components or app layers',
      from: {
        path: '^src/lib',
      },
      to: {
        path: '^src/(components|app)',
      },
    },
    {
      name: 'no-test-imports-in-prod',
      severity: 'error',
      comment: 'Production code must not import test files',
      from: {
        pathNot: ['\\.(test|spec)\\.[jt]sx?$', '^tests/'],
      },
      to: {
        path: '\\.(test|spec)\\.[jt]sx?$',
      },
    },
    {
      name: 'data-files-only-static',
      severity: 'error',
      comment: 'data layer must only contain static data',
      from: {
        path: '^src/data',
      },
      to: {
        path: '^src/(components|app|hooks)',
      },
    },
    {
      name: 'app-cannot-import-components-internal-files',
      severity: 'warn',
      comment: 'App layer should import through stable component entrypoints, not deep internals',
      from: { path: '^src/app' },
      to: { path: '^src/components/.+/.+' },
    },
    {
      name: 'components-cannot-import-storage-directly',
      severity: 'warn',
      comment: 'State orchestration should live in hooks; UI must not couple to storage directly',
      from: { path: '^src/components' },
      to: { path: '^src/lib/storage' },
    },
    {
      name: 'scoring-cannot-import-data',
      severity: 'error',
      comment: 'Scoring must remain pure and input-driven; no hidden dataset coupling allowed',
      from: { path: '^src/lib/scoring' },
      to: { path: '^src/data' },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
  },
};
