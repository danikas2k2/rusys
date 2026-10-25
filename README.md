# RUSYS APP

RUSYS is a web application for managing groups, products, variants, quantities, and change history. The guides below are
organized by topic, with Mermaid diagrams placed alongside the concepts they explain.

## Documentation

- [Architecture and structure](docs/ARCHITECTURE.md) — system context, technologies, directories, modules, and routes.
- [Data and workflows](docs/DATA-AND-WORKFLOWS.md) — MongoDB model, authentication, updates, import and export, and
  offline behavior.
- [Development and deployment](docs/DEVELOPMENT-AND-DEPLOYMENT.md) — local setup, commands, CI, and production releases.
- [Synthetic Monitoring](docs/monitoring/SYNTHETIC-MONITORING.md) — external uptime checks, alerts, dashboard, and
  Grafana credentials.
- [Monitoring overview](docs/monitoring/MONITORING.md) — current monitoring paths and the historical roadmap.
- [Backend tracing](docs/monitoring/BACKEND-TRACING.md) — private OTLP transport, credentials, privacy, and
  verification.

Related guides: [accessibility](ACCESSIBILITY.md), [table components](src/components/table/TABLE.md), and the
[Service Worker](src/components/app/ServiceWorker/README.md).

## Development

```sh
pnpm dev
```

The app runs at `http://localhost:3021`. Before proposing a change, run the code style checks and unit tests:

```sh
pnpm check
```

`pnpm check:all` runs the full set of checks, including coverage and browser tests.

`pnpm test` runs all unit and server data tests without a MongoDB server. `pnpm test:coverage` also checks test
coverage.

Browser navigation tests use a separate temporary MongoDB instance and test data:

```sh
pnpm exec playwright install chromium
pnpm test:e2e
```

Use `pnpm test:e2e:critical` for a quick check of the most important flows. To watch the browser actions, use
`pnpm test:e2e:headed`. `pnpm test:e2e:ui` opens Playwright's interactive UI, where tests must be started by clicking
“Run”.

All `test:e2e` commands run only `*.spec.ts` tests. `pnpm test:visual` runs `*.snap.tsx` tests in Vitest Browser Mode,
and `pnpm test:visual:update` updates their screenshot references. Visual tests mount the app with fixture data and do
not start a Next server or MongoDB. E2E tests use one Next server and a temporary MongoDB instance. Playwright E2E tests
run in one worker: the browser process is reused, but each test gets a clean database and a separate page. Related
actions can be grouped with `test.step` so they run on the same page.

To run selected files, pass their paths to the Playwright command, for example:

```sh
pnpm test:e2e:chromium src/features/groups/GroupsPage.spec.ts src/features/variants/VariantsPage.spec.ts
```

`pnpm test:e2e:chromium` runs only desktop Chromium tests; `pnpm test:e2e` also checks mobile Chromium and WebKit
configurations.

## Code structure

- `src/app` — Next.js routes, the root layout, and `route.ts` API entry points.
- `src/components` — reusable UI components.
- `src/features` — feature-specific UI, such as product or group management.
- `src/store` — client state and API request hooks.
- `src/common` — shared types and pure functions available to both client and server through the `~/common` import
  alias.
- `src/server` — Node.js-only code: MongoDB, data operations, and API handlers.

`src/server/data/products.ts` is the public facade for the product data API. Its implementation is split among
`products/read.ts`, `products/stock.ts`, `products/images.ts`, and `products/mutations.ts` so read queries, stock
transactions, images, and metadata changes do not live in one file.

Generate PWA images and their metadata with:

```sh
pnpm assets
```

## Deployment and rollback

`pnpm deploy` checks the project and uploads only the source files needed for the Docker build directly to the server.
It builds the inactive blue or green app slot. Once that slot starts and passes its health check, Nginx switches traffic
to it. The previous slot keeps running for a quick rollback:

```sh
pnpm deploy:rollback
```

`pnpm deploy:rollback` switches traffic to the previous healthy slot without rebuilding. Deployment and rollback require
a running `rusys-gateway`; rollback also requires a healthy container in the previous slot.
