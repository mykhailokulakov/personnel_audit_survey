# Code Review Findings — 2026-05-04 — 37016e0

**Reviewer:** Claude (repo-wide audit)  
**Repo:** diagnostic-survey  
**Branch / SHA:** work@37016e099c0e18155edcbab33461a6df039f5d39  
**Stack verified:** Next 16.2.4, React 19.2.5, TypeScript 5.9.x, Tailwind CSS 4, Vitest 4.1.5, Playwright 1.59.1, ESLint 9, pnpm 10  
**Test status:** Unit/Coverage pass (451 tests), local E2E failed to start web server within timeout  
**Coverage:** 95.66% statements / 90.02% branches / 93.33% functions / 98.26% lines

## Review file map (order reviewed)

1. `package.json`
2. `src/app/**/*`
3. `src/components/**/*`
4. `src/lib/**/*`
5. `tests/unit/**/*`
6. `tests/e2e/**/*`
7. `eslint.config.mjs`
8. `.dependency-cruiser.cjs`
9. `playwright.config.ts`
10. `.github/workflows/*.yml`
11. `.github/dependabot.yml`

## Section 1 — Executive Summary

Overall health: **Amber**. Core product logic and tests are strong, with high coverage and clean unit-test execution, but there are several correctness/tooling gaps that reduce reliability of CI and framework conformance. Top risks: (1) an App Router page uses raw anchor navigation instead of `next/link`; (2) local E2E runs fail due to missing web server startup timeout tuning; (3) dependency-cruiser is configured to emit persistent orphan warnings that currently include intentionally retained modules, reducing signal quality; (4) ESLint configuration omits accessibility linting despite UI-heavy code paths; (5) dependency audit reports a moderate transitive vulnerability (`postcss` via Next) that is currently unresolved at repo level. None are immediate production blockers alone, but together they increase regression risk and reduce confidence in automated checks.

## Section 2 — Project Snapshot

- Files scanned (src/tests/.github): **142**
- Approx LOC (src TS/TSX/CSS/JSON): **6031**
- Route pages (`src/app/**/page.tsx`): **10**
- Unit test files: **33**
- E2E test files: **13**
- Coverage run: pass, above threshold
- Stack divergence from assumption: uses `@base-ui/react` instead of canonical Radix-based shadcn runtime; otherwise aligned.

## Section 3 — Findings

### NEXT-01 — Internal navigation uses raw anchor instead of `next/link`

- **Severity:** Medium
- **Category:** Next.js
- **Location:** `src/app/results/page.tsx:L11-L13`
- **Effort:** S (<30min)

**Current code:**

```tsx
<p className="text-sm text-muted-foreground">
  Якщо ви хочете пройти анкету,{' '}
  <a href="/survey" className="underline underline-offset-4 hover:text-foreground">
    натисніть тут
  </a>
  .
</p>
```

**What's wrong:**
The App Router page uses a raw `<a>` element for internal navigation. In Next.js App Router, internal links should use `Link` from `next/link` for client-side navigation semantics and consistent prefetch behavior.

**Why it matters:**
Raw anchors trigger full document navigation and skip framework optimizations, which can regress UX and invalidate assumptions in route-level loading/error behavior.

**Fix:**
Import `Link` from `next/link` and replace the anchor with `Link href="/survey"`.

```tsx
import Link from 'next/link';

<Link href="/survey" className="underline underline-offset-4 hover:text-foreground">
  натисніть тут
</Link>;
```

**Acceptance criteria:**

- `src/app/results/page.tsx` has no internal `<a href="/...">`.
- `pnpm lint` passes.
- Navigation to `/survey` works without full page refresh.

**Dependencies on other findings:** None

### TEST-01 — Local E2E configuration is brittle (web server startup timeout)

- **Severity:** High
- **Category:** Testing
- **Location:** `playwright.config.ts:L33-L37`
- **Effort:** S (<30min)

**Current code:**

```ts
webServer: {
  command: 'pnpm dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env['CI'],
},
```

**What's wrong:**
No explicit `timeout` is configured for web server startup. Local run failed with `Timed out waiting 60000ms from config.webServer`, indicating default timeout is too strict for current startup characteristics.

**Why it matters:**
Developers get false-negative E2E failures unrelated to app behavior, lowering trust in tests and slowing PR validation.

**Fix:**
Set explicit `webServer.timeout` (e.g., `120_000` or `180_000`) and optionally use a production server command for stability.

```ts
webServer: {
  command: 'pnpm dev',
  url: 'http://localhost:3000',
  timeout: 180_000,
  reuseExistingServer: !process.env['CI'],
},
```

**Acceptance criteria:**

- `pnpm test:e2e` starts web server reliably on a clean local machine.
- No timeout error appears before tests begin.

**Dependencies on other findings:** None

### TOOL-01 — dependency-cruiser orphan rule has persistent known-noise warnings

- **Severity:** Medium
- **Category:** Tooling
- **Location:** `.dependency-cruiser.cjs:L14-L33`, `src/lib/storage/persistence.ts:L1-L42`
- **Effort:** M (30min–2h)

**Current code:**

```js
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
```

**What's wrong:**
`pnpm deps:check` consistently reports 9 orphan warnings, including intentionally retained modules/types. This creates warning fatigue and dilutes architectural signal.

**Why it matters:**
Developers may ignore output entirely, missing real architecture violations when they arise.

**Fix:**
Either (a) wire intended modules into actual imports, or (b) explicitly exclude approved standalone contracts/stubs from orphan detection using targeted regex patterns.

**Acceptance criteria:**

- `pnpm deps:check` outputs zero expected-noise warnings.
- Any remaining warnings represent actionable drift.

**Dependencies on other findings:** None

### TOOL-02 — ESLint config lacks explicit accessibility plugin coverage

- **Severity:** Medium
- **Category:** Tooling
- **Location:** `eslint.config.mjs:L1-L75`
- **Effort:** M (30min–2h)

**Current code:**

```ts
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import reactHooks from 'eslint-plugin-react-hooks';
...
rules: {
  'no-console': ['error', { allow: ['warn', 'error'] }],
  'react-hooks/exhaustive-deps': 'error',
},
```

**What's wrong:**
Config relies on Next presets but does not explicitly include/verify `jsx-a11y` rule scope for all relevant JSX surfaces (including tests/story-like files if added later).

**Why it matters:**
A11y regressions can slip into interactive survey UI; explicit plugin configuration improves clarity and future-proofing.

**Fix:**
Add explicit `eslint-plugin-jsx-a11y` config block (or document intentional inheritance and add a guard test/check proving active rules).

**Acceptance criteria:**

- Lint config contains explicit a11y rule coverage or documented proof via `eslint --print-config` check.
- At least one meaningful a11y rule enabled for TSX files.

**Dependencies on other findings:** None

### DEP-01 — `pnpm audit` reports moderate `postcss` vulnerability via Next

- **Severity:** Low
- **Category:** Dependencies
- **Location:** `package.json:L1-L87` (transitive through `next`)
- **Effort:** M (30min–2h)

**Current code:**

```json
"dependencies": {
  "next": "16.2.4",
  ...
}
```

**What's wrong:**
`pnpm audit --prod` reports GHSA-qx2v-qp2m-jg93 affecting `postcss <8.5.10` via dependency path `.>next>postcss`.

**Why it matters:**
Even transitive vulnerabilities can become exploitable depending on usage surface and deployment context.

**Fix:**
Check if newer `next` release resolves patched `postcss`, or apply a package-manager override/resolution to force patched version if compatible.

**Acceptance criteria:**

- `pnpm audit --prod` no longer reports GHSA-qx2v-qp2m-jg93.
- App build and tests still pass after upgrade/override.

**Dependencies on other findings:** None

## Section 4 — Dependency Report

| Package                         | Current  | Latest | Type | Action             | Effort |
| ------------------------------- | -------- | ------ | ---- | ------------------ | ------ |
| @commitlint/cli                 | 20.5.2   | 20.5.3 | dev  | patch upgrade      | S      |
| @commitlint/config-conventional | 20.5.0   | 20.5.3 | dev  | patch upgrade      | S      |
| jsdom                           | 29.1.0   | 29.1.1 | dev  | patch upgrade      | S      |
| dependency-cruiser              | 17.3.10  | 17.4.0 | dev  | patch upgrade      | S      |
| react-hook-form                 | 7.74.0   | 7.75.0 | prod | patch upgrade      | S      |
| zod                             | 4.3.6    | 4.4.3  | prod | patch upgrade      | S      |
| @types/node                     | 20.19.39 | 25.6.0 | dev  | major-plan upgrade | M      |
| eslint                          | 9.39.4   | 10.3.0 | dev  | major-plan upgrade | M      |
| typescript                      | 5.9.3    | 6.0.3  | dev  | major-plan upgrade | L      |

## Section 5 — Architecture Rules Proposal

```js
// .dependency-cruiser.cjs additions
{
  name: 'app-cannot-import-components-internal-files',
  severity: 'warn',
  from: { path: '^src/app' },
  to: { path: '^src/components/.+/.+' }
}
```

Justification: encourages imports through stable component entrypoints rather than deep internals.

```js
{
  name: 'components-cannot-import-storage-directly',
  severity: 'warn',
  from: { path: '^src/components' },
  to: { path: '^src/lib/storage' }
}
```

Justification: nudges state orchestration into hooks/use-cases and reduces UI coupling to storage details.

```js
{
  name: 'scoring-cannot-import-data',
  severity: 'error',
  from: { path: '^src/lib/scoring' },
  to: { path: '^src/data' }
}
```

Justification: keeps scoring pure and input-driven; prevents hidden dataset coupling.

## Section 6 — Remediation Plan

1. **Phase 1 — Critical/High fixes**: TEST-01  
   Acceptance: local E2E boot is reliable; no startup timeout failures.
2. **Phase 2 — Test coverage uplift**: validate E2E pass path after TEST-01  
   Acceptance: `pnpm test:e2e` green locally and in CI.
3. **Phase 3 — Tooling/CI tightening**: TOOL-01, TOOL-02  
   Acceptance: `pnpm deps:check` noise removed; explicit a11y lint coverage documented.
4. **Phase 4 — Dependency upgrades**: DEP-01 + patch updates table  
   Acceptance: audit issue resolved; unit/coverage/build remain green.
5. **Phase 5 — Nice-to-have refactors**: NEXT-01  
   Acceptance: no raw internal anchors in App Router pages.

## Section 7 — Out of Scope / Won't Fix

- No recommendation to reduce existing high unit-test density: current 451 passing tests with high coverage show good ROI.
- No immediate migration to additional state libraries: Zustand usage appears adequate for current scope.
