# CLAUDE.md — Persistent context for Claude Code Action

## Project

**Diagnostic Survey** — інтерактивна діагностична анкета для оцінки профілю респондентів.
Stack: Next.js 16 (App Router, Turbopack), TypeScript strict, Tailwind CSS, shadcn/ui, pnpm.

## Key commands

```bash
pnpm dev              # start dev server (Turbopack)
pnpm build            # production build
pnpm test             # unit tests (vitest)
pnpm test:coverage    # unit tests + coverage report
pnpm test:e2e         # playwright e2e tests
pnpm lint             # ESLint (0 warnings allowed)
pnpm format           # Prettier check
pnpm typecheck        # tsc --noEmit
pnpm deps:check       # dependency-cruiser architecture check
pnpm validate         # runs all of the above + coverage gate
```

## Architecture layers

```
src/app/          App Router — pages, layouts. Minimize "use client". No business logic here.
src/components/   UI components — imports from src/lib and src/data only.
src/lib/          Pure functions — no React, no Next.js imports. Domain logic, scoring, utilities.
src/data/         Static JSON data and type definitions only — no imports from components/app/hooks.
src/hooks/        Custom React hooks — can import from src/lib.
```

### Layer rules (enforced by dependency-cruiser):

- `src/lib` → must NOT import from `src/components` or `src/app`
- `src/components` → must NOT import from `src/app`
- `src/data` → must NOT import from `src/components`, `src/app`, or `src/hooks`
- No circular dependencies anywhere
- No prod code imports test files

## Hard rules

- **TypeScript strict**: no `any`, no `// @ts-ignore`, no `// @ts-expect-error` without documented justification
- **No localStorage / sessionStorage**: all survey data lives in memory only (business requirement)
- **No PII**: never store respondent's full name — only anonymous respondent codes
- **JSDoc required** on all public API functions in `src/lib/`
- **Coverage ≥ 80%** (lines/statements/functions) and ≥ 75% branches — enforced in CI
- **Conventional Commits** for all commits
- No `console.log` in production code (only `console.warn` and `console.error` allowed)

## PR review instructions

Search for:

- Race conditions and missing `useEffect` dependency arrays
- Type holes (`any`, unsafe assertions, widened return types)
- Architecture layer violations
- Missing edge cases in tests (only happy-path tests are not enough)
- Code duplication
- Dead code
- Functions longer than 50 lines
- `localStorage` / `sessionStorage` usage
- PII logging (respondent name, personal data)
- Missing `aria-label`, `alt`, or other a11y attributes
- Missing JSDoc on public `src/lib` functions

Verify:

- Implementation matches docs/PRD.md
- PRD/CLAUDE.md are updated when requirements change

Response format:

1. **Summary** — one sentence
2. **Blocker issues** — must fix before merge
3. **Recommendations** — important but non-blocking
4. **Optional improvements** — minor future improvements

Do not praise. Only concrete actionable feedback.
If everything is fine — brief LGTM + 1-2 future improvements.
Language: Ukrainian for product context, English for code snippets.

## References

- PRD: docs/PRD.md
- Architecture diagram: docs/architecture.svg
- Agent instructions: AGENTS.md
