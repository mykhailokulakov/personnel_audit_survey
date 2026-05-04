# Diagnostic Survey

Інтерактивна діагностична анкета для оцінки профілю респондентів.

Частина репозиторію `generic_llm_experiments` — дослідний проєкт для вивчення можливостей LLM у розробці продуктів.

## Stack

| Layer           | Technology                              |
| --------------- | --------------------------------------- |
| Framework       | Next.js 16 (App Router, Turbopack)      |
| Language        | TypeScript 5 (strict)                   |
| Styling         | Tailwind CSS 4 + shadcn/ui              |
| Package manager | pnpm 10                                 |
| Unit tests      | Vitest 4 + React Testing Library        |
| E2E tests       | Playwright                              |
| Linting         | ESLint 9 (flat config) + Prettier       |
| Architecture    | dependency-cruiser                      |
| Git hooks       | Husky + lint-staged + Commitlint        |
| CI              | GitHub Actions                          |
| Security        | CodeQL + Dependabot + dependency-review |
| AI review       | Claude Code Action (Opus)               |

## Prerequisites

- Node.js 20+
- pnpm 9+

## Commands

```bash
pnpm install          # install dependencies
pnpm dev              # start dev server on http://localhost:3000
pnpm build            # production build
pnpm start            # start production server

pnpm test             # run unit tests
pnpm test:watch       # run unit tests in watch mode
pnpm test:coverage    # run unit tests with coverage
pnpm test:e2e         # run Playwright e2e tests

pnpm lint             # ESLint check
pnpm lint:fix         # ESLint auto-fix
pnpm format           # Prettier check
pnpm format:fix       # Prettier auto-fix
pnpm typecheck        # TypeScript type check
pnpm deps:check       # architecture rules check
pnpm validate         # run all checks + coverage gate
```

## Documentation

| Document                                       | Description                                                  |
| ---------------------------------------------- | ------------------------------------------------------------ |
| [User Guide](docs/USER_GUIDE.md)               | How to conduct assessments and interpret results (Ukrainian) |
| [Calibration Guide](docs/CALIBRATION_GUIDE.md) | How to tune scoring thresholds and add questions             |
| [PRD](docs/PRD.md)                             | Product Requirements Document                                |

## Project structure

```
src/
  app/                 Next.js App Router pages and layouts
  components/
    ui/                shadcn/ui generated components
    survey/            Survey-specific components
  lib/
    scoring/           Scoring algorithms (pure functions)
    storage/           In-memory state management
    types/             Shared TypeScript types
  data/
    questions/         Question bank JSON
  hooks/               Custom React hooks
tests/
  unit/                Vitest unit tests
  e2e/                 Playwright e2e tests
docs/                  PRD, architecture diagram
scripts/               CI helper scripts
.github/
  workflows/           GitHub Actions
  ISSUE_TEMPLATE/      Issue templates
```

## Quality gates

All must pass before merge:

| Gate                                  | Threshold                        |
| ------------------------------------- | -------------------------------- |
| TypeScript                            | 0 errors                         |
| ESLint                                | 0 warnings                       |
| Prettier                              | clean                            |
| Architecture                          | 0 violations                     |
| Coverage (lines/statements/functions) | ≥ 80%                            |
| Coverage (branches)                   | ≥ 75%                            |
| E2E tests                             | pass                             |
| CodeQL                                | no high/critical                 |
| Dependency review                     | no high severity                 |
| Claude PR Review                      | LGTM (non-blocking but required) |

## Branch protection (налаштувати вручну)

Після push до GitHub: **Settings → Rules → Rulesets** → створити ruleset для гілки `main`:

- **Require pull request before merging**
  - Required approvals: 1
  - Dismiss stale pull request approvals when new commits are pushed: ✓
- **Require status checks to pass**:
  - `typecheck`
  - `lint`
  - `architecture`
  - `test-unit`
  - `test-e2e`
  - `build`
  - `Claude PR Review` _(після налаштування Claude App)_
  - `CodeQL`
  - `Dependency Review`
- **Require branches to be up to date before merging**: ✓
- **Require conversation resolution before merging**: ✓
- **Require linear history**: ✓
- **Restrict pushes that create matching refs** (тільки через PR): ✓
- **Do not allow bypassing the above settings**: ✓

## Roadmap

| Milestone | Description                                       | Status  |
| --------- | ------------------------------------------------- | ------- |
| M0        | Bootstrap — Next.js 16, quality automation, CI/CD | ✅ Done |
| M1        | Survey engine — question flow, branching logic    | ✅ Done |
| M2        | Scoring module — profile calculation              | ✅ Done |
| M3        | Results page — visualization, export              | ✅ Done |
| M4        | Quality & CI                                      | ✅ Done |
| M5        | Data integrity & exports                          | ✅ Done |
| M6        | Polish — a11y, mobile, PDF export, calibration    | ✅ Done |

## Known Limitations

- No backend — results exist only in browser memory. Download JSON before closing the tab.
- The "Copy link" feature is a stub — shared links require a backend to be implemented.
- Archetype thresholds are empirically set. Recalibration on real data is recommended after pilot use.
- PDF export uses client-side rendering (html2canvas). Complex charts may render differently than on screen.

## Privacy & Data

- **Анонімні коди**: ніякого ПІБ, тільки анонімні ідентифікатори респондентів
- **Дані тільки в пам'яті**: жодного `localStorage`, `sessionStorage` або бази даних на клієнті
- **Не логувати**: коди респондентів не виводяться в plain text у логах
- **Валідація**: всі вхідні дані валідуються і на клієнті, і на сервері (коли з'явиться backend)
