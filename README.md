# ABET Faculty Vitae frontend

React and TypeScript interface for uploading faculty CVs, reviewing extracted information and generating consistently formatted ABET faculty vitae.

## Requirements

- Node.js 24 LTS (`.nvmrc`)
- pnpm 12.11.2 through Corepack
- The backend on `http://localhost:8080`, or another target supplied through `VITE_DEV_API_TARGET`

```bash
corepack enable
corepack prepare pnpm@12.11.2 --activate
pnpm install --frozen-lockfile
pnpm dev
```

Copy `.env.example` to `.env.local` only when a local override is needed. All `VITE_*` values are public browser configuration and must never contain credentials or API keys.

## Architecture

The source is organised by feature so domain types, API contracts, orchestration and presentation remain close together:

```text
src/
  app/                  application routing
  features/home/
    api/                HTTP and interface adapters
    components/         reusable feature presentation
    hooks/              feature orchestration
    model/              runtime schemas and domain logic
    pages/              route-level composition
    testing/            development-only fixtures
  shared/
    components/         cross-feature UI primitives
    http/               authenticated HTTP boundary
    theme/              light/dark preference
  styles/               global Tailwind theme and primitives
```

Components never own server data. `HomeApi` is the boundary for backend operations, Zod validates all response data at runtime, and the page derives its faculty/admin composition from API-provided roles. The production adapter expects:

- `GET /api/home`

The initial frontend is intentionally read-only. CV importing, review changes and verification will be connected in later workflows.

## Development scenarios

`pnpm dev:mock` loads development-only fixtures. Select a view with a query parameter:

- `/?scenario=returning`
- `/?scenario=first-time`
- `/?scenario=admin`
- `/?scenario=combined`

The mock adapter cannot be enabled in a production build.

## Quality checks

```bash
pnpm check
pnpm audit
```

`pnpm check` runs ESLint, strict TypeScript checking, Vitest and a production Vite build. GitHub Actions runs these checks for every push and pull request; CodeQL scans JavaScript and TypeScript on changes to `main` and weekly. Dependabot maintains pnpm and GitHub Actions dependencies.

See [SECURITY.md](SECURITY.md) for deployment and vulnerability-reporting guidance.
