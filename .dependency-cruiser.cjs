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
