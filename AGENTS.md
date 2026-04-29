# AGENTS.md — Instructions for local AI tooling

This file is for local AI agents (Cursor, Continue, Claude Code CLI, etc.).
See also: CLAUDE.md for project context and hard rules.

## Getting started

```bash
# Prerequisites: Node 20+, pnpm 9+
pnpm install
pnpm dev          # http://localhost:3000
```

## Running checks

```bash
pnpm typecheck         # must be 0 errors
pnpm lint              # must be 0 warnings
pnpm format            # must be clean
pnpm deps:check        # architecture rules
pnpm test:coverage     # coverage ≥ 80%
pnpm validate          # all of the above
```

## Where things are

| Location                 | Purpose                              |
| ------------------------ | ------------------------------------ |
| `src/app/`               | Next.js App Router pages and layouts |
| `src/components/ui/`     | shadcn/ui generated components       |
| `src/components/survey/` | Survey-specific UI components        |
| `src/lib/scoring/`       | Scoring algorithms (pure functions)  |
| `src/lib/storage/`       | In-memory state management           |
| `src/lib/types/`         | Shared TypeScript types              |
| `src/data/questions/`    | Question bank JSON data              |
| `src/hooks/`             | Custom React hooks                   |
| `tests/unit/`            | Vitest unit tests                    |
| `tests/e2e/`             | Playwright e2e tests                 |
| `docs/`                  | PRD, architecture diagram            |
| `scripts/`               | CI helper scripts                    |

## Common task templates

### Add a new UI component

```bash
# Generate with shadcn/ui
pnpm dlx shadcn@latest add <component-name>
# Place survey-specific components in src/components/survey/
# Place generic UI in src/components/ui/
```

### Add a new lib function

1. Create file in `src/lib/<domain>/`
2. Add JSDoc to the exported function
3. Add unit test in `tests/unit/<domain>.test.ts`
4. Run `pnpm test:coverage` — must stay ≥ 80%

### Add a new page

1. Create `src/app/<route>/page.tsx`
2. Keep "use client" to a minimum — prefer Server Components
3. Business logic goes in `src/lib/`, not in the page

### Add a test

```bash
# Unit test
# File: tests/unit/<feature>.test.ts
import { describe, it, expect } from 'vitest';

# E2E test
# File: tests/e2e/<flow>.spec.ts
import { test, expect } from '@playwright/test';
```

### Update PRD

Edit `docs/PRD.md` and update `CLAUDE.md` if architectural constraints change.

## Architecture constraints

All constraints are enforced automatically via `pnpm deps:check`:

- `src/lib` is pure — no React/Next.js imports
- `src/components` does not import `src/app`
- `src/data` is static — no component/hook imports
- No circular dependencies
- No production code imports test files

## Commitlint

All commits must follow Conventional Commits:

```
feat: add scoring algorithm for profile X
fix: correct branching logic in question flow
chore: update dependency-cruiser config
docs: update PRD with new question categories
test: add edge cases for scoring module
refactor: extract validation to lib/validation
```

## Security notes

- Never use `localStorage` or `sessionStorage` — data lives in memory only
- Never log respondent codes in plain text
- Validate all user inputs both client-side and server-side (when backend exists)
- No PII (full names, emails) stored anywhere in code or logs
