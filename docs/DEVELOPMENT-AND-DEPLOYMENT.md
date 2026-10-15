# RUSYS development and deployment

This guide covers local setup, checks, CI, and production deployment. [Project README](../README.md).

## Local development

The package requires Node.js 24 or newer and specifies `pnpm@11.24.0`.

```sh
pnpm install
pnpm config
pnpm dev
```

The development server runs at `http://localhost:3021`. Local configuration is read from `.env.local`; keep credentials
out of Git.

| Command              | Purpose                                    |
| -------------------- | ------------------------------------------ |
| `pnpm config`        | Configure the repository's Git hooks       |
| `pnpm dev`           | Start the Next.js development server       |
| `pnpm build`         | Build the production application           |
| `pnpm start`         | Run a production build                     |
| `pnpm format`        | Format files with Prettier                 |
| `pnpm format:check`  | Check formatting                           |
| `pnpm lint:ts`       | Run TypeScript checks                      |
| `pnpm lint:es`       | Run ESLint                                 |
| `pnpm lint:styles`   | Run Stylelint on CSS                       |
| `pnpm lint`          | Run all four static checks sequentially    |
| `pnpm test`          | Run Vitest                                 |
| `pnpm test:coverage` | Run Vitest with coverage                   |
| `pnpm test:e2e`      | Run Playwright `*.spec.ts` tests           |
| `pnpm test:a11y`     | Run Playwright axe accessibility scans     |
| `pnpm test:visual`   | Run Vitest Browser Mode `*.snap.tsx` tests |
| `pnpm check`         | Run lint and unit tests                    |
| `pnpm check:all`     | Run lint, coverage, visual, and E2E tests  |
| `pnpm assets`        | Generate and optimize PWA assets           |

The four Noto families are loaded through `next/font/google` in `src/app/layout.tsx`. A production build downloads and
self-hosts them as hashed `/_next/static/` assets, so the build needs access to Google Fonts. Browsers request all fonts
from this app. Next.js supplies immutable cache headers, and the service worker caches requested static assets for later
offline use.

Browser tests require installed browsers. E2E tests use a temporary MongoDB instance and one worker so database resets
cannot overlap. Visual tests use scenario fixtures instead of MongoDB and mount the app in Vitest Browser Mode. The
Playwright provider supplies Chromium and WebKit; configuration lives in `playwright.config.ts` for E2E and
`vitest.visual.config.mts` for visual tests. Unit and server tests use `vitest.config.mts`. Accessibility scans are
Playwright tests colocated with their feature; they share the axe assertion in `src/tests/playwright/accessibility.ts`
and run through `pnpm test:a11y`.

Run `pnpm config` after installing dependencies to enable the repository's Git hooks. The pre-commit hook runs Gitleaks
on staged changes, followed by `pnpm lint`. Prettier, ESLint, and Stylelint cache results for unchanged files;
TypeScript stores incremental project information. Their local cache files are ignored by Git. The first run still
checks the full project, while later runs reuse cached results where possible.

## Continuous integration

The workflow in `.github/workflows/ci.yml` runs on pushes and pull requests targeting `main`. Its `lint` matrix runs
formatting, TypeScript, ESLint, and Stylelint concurrently as individually named jobs. The test group contains build and
Vitest coverage, Playwright E2E, Lighthouse accessibility, and Chromium/WebKit visual snapshots. Each test job depends
on available runners and starts alongside lint. If a lint check fails, the lint matrix cancels its remaining checks and
four cancellation jobs stop any running or queued browser jobs. Build and coverage continue independently so their
results remain visible. A failure in any lint or test job fails the workflow.

```mermaid
flowchart TB
    Trigger[Push or pull request to main]
    subgraph Lint["Lint matrix"]
        Format[Prettier]
        TS[TypeScript]
        ESLint[ESLint]
        Stylelint[Stylelint]
    end
    Trigger --> Format
    Trigger --> TS
    Trigger --> ESLint
    Trigger --> Stylelint
    subgraph Tests["Test jobs"]
        Build[Build and Vitest coverage]
        E2E[Playwright E2E]
        LH[Lighthouse]
        VisualC[Chromium visual snapshots]
        VisualW[WebKit visual snapshots]
    end
    Trigger --> Build
    Trigger --> E2E
    Trigger --> LH
    Trigger --> VisualC
    Trigger --> VisualW
    Format --> LintFailure{Lint failed?}
    TS --> LintFailure
    ESLint --> LintFailure
    Stylelint --> LintFailure
    LintFailure -->|Yes| Cancel[Cancel browser jobs]
    Cancel -.-> E2E
    Cancel -.-> LH
    Cancel -.-> VisualC
    Cancel -.-> VisualW
    Build --> Result{CI result}
    Format --> Result
    TS --> Result
    ESLint --> Result
    Stylelint --> Result
    E2E --> Result
    LH --> Result
    VisualC --> Result
    VisualW --> Result
```

The browser jobs each use a unique concurrency group for this workflow run. After a lint failure, the cancellation
matrix enters those same groups and cancels active or pending browser jobs. It also publishes a failure marker so a
browser job admitted later stops before checkout or browser setup. To add another lint check, add one entry to
`jobs.lint.strategy.matrix.check`; no test dependencies need updating. The lint matrix uses `fail-fast: true` to start
cancellation promptly after the first failure, so some other lint checks may be canceled before they finish. The
[accessibility guide](../ACCESSIBILITY.md) covers JSX rules, component axe tests, Playwright scans, and Lighthouse CI.

## Deployment and rollback

The production image is built from [docker/Dockerfile](../docker/Dockerfile).
[docker/compose.yaml](../docker/compose.yaml) defines a MongoDB replica set, blue and green application containers, and
an Nginx gateway. Both application containers share the MongoDB service and image directory.

```mermaid
flowchart LR
    Deploy[pnpm deploy] --> Checks[pnpm check]
    Checks --> Build[Docker build]
    Build --> Idle[Inactive blue or green container]
    Idle --> Health{Health check}
    Health -->|Pass| Gateway[Nginx switches traffic]
    Gateway --> Active[New active version]
    Old[Previous running version] --> Rollback[pnpm deploy:rollback]
    Rollback --> Gateway
    Mongo[(MongoDB)] --> Idle
    Mongo --> Old
    Images[(Shared image directory)] --> Idle
    Images --> Old
```

`pnpm deploy` runs `pnpm check`, builds the inactive container, waits for its health check, and switches Nginx traffic.
The previous container remains running. `pnpm deploy:rollback` returns traffic to that healthy container without
rebuilding. Deployment requires a running `rusys-gateway`; rollback also requires a healthy previous container.

### Automatic production releases

The [production deployment workflow](../.github/workflows/deploy-production.yml) runs when a push to `main` changes
`package.json`, including a pull request merge that changes the file. It compares the project version before and after
the push. If the version is unchanged, it skips the test and deployment jobs. A push that does not change `package.json`
does not start this workflow. The package's `version` script also updates Docker's `APP_VERSION` build label in
`docker/compose.yaml`.

For a release, the workflow calls the full [CI workflow](../.github/workflows/ci.yml), including lint, build, coverage,
E2E, Lighthouse, and visual tests. The production job starts only after every CI job passes. It checks out the pushed
commit, configures SSH, and runs `pnpm deploy:run`. The deployment script reports failure if upload, Docker build,
health checks, or the gateway switch fails. It checks required Docker build sources before connecting and creates an
empty `scripts/postcss` directory if the checkout omits it, so Docker can still copy that path. Production deployments
are serialized.

Create a GitHub Actions environment named `production` in the repository settings. Restrict its deployment branches to
`main`. Add these environment settings:

| Name                     | Type     | Value                                                           |
| ------------------------ | -------- | --------------------------------------------------------------- |
| `DEPLOY_SSH_PRIVATE_KEY` | Secret   | Private SSH key for the deployment user                         |
| `DEPLOY_SSH_KNOWN_HOSTS` | Secret   | Verified SSH host key entry for the server                      |
| `DEPLOY_USER`            | Variable | SSH user                                                        |
| `DEPLOY_HOST`            | Variable | SSH host                                                        |
| `DEPLOY_PORT`            | Variable | SSH port; optional, defaults to `22`                            |
| `DEPLOY_PATH`            | Variable | Existing application directory on the server                    |
| `DOCKER_PATH`            | Variable | Docker executable on the server; optional, defaults to `docker` |

The SSH user needs access to the application directory and Docker on the server. The server keeps its own `.env` for
Compose; do not upload it or add it to Git. Verify the host key out of band before saving `DEPLOY_SSH_KNOWN_HOSTS`;
include `[host]:port` for a nonstandard SSH port. Environment secrets become available only to the deployment job.
Required reviewers can be added when releases need a manual approval, but leave them unset for fully automatic
deployment.

## When changing the project

- Put types and pure functions shared by client and server in `src/common`; keep MongoDB access and secrets in
  `src/server`.
- Group feature-specific UI under `src/features` and reusable UI under `src/components`.
- For a new REST endpoint, add its App Router `route.ts`, server handler, shared API path, and relevant tests.
- Add new pages to the Playwright accessibility route list and Lighthouse URL configuration.
- Update the relevant documentation section when architecture, commands, or deployment behavior changes.
