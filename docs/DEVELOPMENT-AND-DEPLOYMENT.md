# RUSYS development and deployment

## Local development

Use the Node.js and pnpm versions specified in [package.json](../package.json).

```sh
pnpm install
pnpm config
pnpm dev
```

Local configuration is read from `.env.local`. Set `PORT=3021` for `http://localhost:3021` and `DB` to a MongoDB
connection URI. Use a replica set for stock transactions. Keep credentials out of Git.

| Command              | Purpose                                          |
| -------------------- | ------------------------------------------------ |
| `pnpm config`        | Configure the repository's Git hooks             |
| `pnpm dev`           | Start the Next.js development server             |
| `pnpm build`         | Build the production application                 |
| `pnpm start`         | Run a production build                           |
| `pnpm format`        | Format files with Prettier                       |
| `pnpm format:check`  | Check formatting                                 |
| `pnpm lint:ts`       | Run TypeScript checks                            |
| `pnpm lint:es`       | Run ESLint                                       |
| `pnpm lint:styles`   | Run Stylelint on CSS                             |
| `pnpm lint`          | Run all four static checks sequentially          |
| `pnpm test`          | Run Vitest                                       |
| `pnpm test:coverage` | Run Vitest with coverage                         |
| `pnpm test:e2e`      | Run critical Playwright flows (`@critical`)      |
| `pnpm test:a11y`     | Run Playwright axe accessibility scans           |
| `pnpm test:browser`  | Run layout and visual tests together             |
| `pnpm test:layout`   | Run fixture-based browser layout tests           |
| `pnpm test:visual`   | Run Vitest Browser Mode `*.snap.tsx` tests       |
| `pnpm check`         | Run lint and unit tests                          |
| `pnpm check:all`     | Run lint, coverage, browser, E2E, and axe checks |
| `pnpm assets`        | Generate and optimize PWA assets                 |

Production builds need access to Google Fonts. Next.js self-hosts the resulting Noto font assets.

```sh
pnpm exec playwright install chromium webkit
pnpm test:e2e:chromium src/features/groups/GroupsPage.spec.ts
pnpm test:layout
pnpm test:a11y
```

See [test specifications](../src/tests/SPECS.md) for project selection and fixture requirements.

## Continuous integration

The [CI workflow](../.github/workflows/ci.yml) runs on pushes and pull requests to `main`.

| Job        | Checks                                                 |
| ---------- | ------------------------------------------------------ |
| Lint       | Prettier, TypeScript, ESLint, and Stylelint            |
| Build      | Production build and Vitest coverage                   |
| Browser    | Layout tests, critical Playwright flows, and axe scans |
| Lighthouse | Accessibility scores on configured routes              |
| Visual     | Chromium and WebKit screenshot comparisons             |

Lint failures cancel the browser, Lighthouse, and visual jobs. Build and coverage run independently.

## Deployment targets

The Docker deployment uses Node.js, a MongoDB replica set, persistent image storage, and outbound HTTPS for Google
authentication. When using a different runtime, verify support for Node.js APIs, the MongoDB driver, Sharp, persistent
storage, and OpenTelemetry.

## Deployment and rollback

The production image is built from [docker/Dockerfile](../docker/Dockerfile).
[docker/compose.yaml](../docker/compose.yaml) defines a MongoDB replica set, blue and green application containers, an
Nginx gateway, and separate Alloy services for monitoring and traces. Both application containers share the MongoDB
service and image directory. The Docker build uses BuildKit cache mounts for the pnpm store and Turbopack cache. The
runtime image contains the standalone Next.js server, static files, and public assets.

Create `.env.deploy.local` on the workstation:

```dotenv
DEPLOY_USER=deploy
DEPLOY_HOST=app.example.com
DEPLOY_PORT=22
DEPLOY_PATH=/srv/rusys
```

Install SSH and rsync on the workstation. On the server, provision Docker Compose, MongoDB, persistent image storage,
the Compose `.env`, and a running `rusys-gateway`.

```sh
pnpm deploy
```

The command runs `pnpm check`, uploads the build sources, and builds the inactive slot. Before switching traffic, it
waits for the candidate's health check and calls its loopback readiness endpoint. The endpoint verifies that the
application's MongoDB connection can read the `groups` collection. An empty collection passes the check. If readiness
fails, traffic stays on the active slot. The gateway blocks access to the readiness endpoint.

The previous container stops after the old Nginx workers exit. The drain timeout is six minutes. At timeout the deploy
command reports failure and leaves the previous container running.

### Monitoring integrations

Set the following variables in the server-side Compose `.env`.

| Configuration                                           | Purpose                                                              |
| ------------------------------------------------------- | -------------------------------------------------------------------- |
| `GC_METRICS_URL`, `GC_METRICS_USER`, `GC_METRICS_TOKEN` | Metrics destination and scoped write credentials                     |
| `GC_LOKI_URL`, `GC_LOKI_USER`, `GC_LOKI_TOKEN`          | Log destination and scoped write credentials                         |
| `GC_OTLP_ENDPOINT`, `GC_OTLP_USER`, `GC_OTLP_TOKEN`     | Trace destination and scoped write credentials                       |
| `DB_MONITORING_URI`                                     | Dedicated database monitoring identity                               |
| `DOCKER_ROOT_DIR`                                       | Docker data directory for the supplied container metrics integration |

cAdvisor uses privileged access and host filesystem mounts. Alloy uses Docker discovery. See the
[monitoring guides](monitoring/MONITORING.md) for collector setup and verification queries.

### Rollback

Start the previous slot on the server and wait for it to become healthy. Then switch the gateway from the workstation:

```sh
pnpm deploy:rollback
```

### Automatic production releases

CI deploys a push to `main` after all checks pass and the package version changes. The package version script updates
the Compose `APP_VERSION` build argument. CI runs `pnpm deploy:run`, which connects to the server over SSH.

Create a GitHub Actions environment named `production` in the repository settings. Restrict its deployment branches to
`main`. Add these environment settings:

| Name                     | Type     | Value                                        |
| ------------------------ | -------- | -------------------------------------------- |
| `DEPLOY_SSH_PRIVATE_KEY` | Secret   | Private SSH key for the deployment user      |
| `DEPLOY_SSH_KNOWN_HOSTS` | Secret   | Verified SSH host key entry for the server   |
| `DEPLOY_USER`            | Variable | SSH user                                     |
| `DEPLOY_HOST`            | Variable | SSH host                                     |
| `DEPLOY_PORT`            | Variable | SSH port; optional, defaults to `22`         |
| `DEPLOY_PATH`            | Variable | Existing application directory on the server |

The SSH user needs access to the application directory and Docker on the server. The server keeps its own `.env` for
Compose; do not upload it or add it to Git. Verify the host key out of band before saving `DEPLOY_SSH_KNOWN_HOSTS`;
include `[host]:port` for a nonstandard SSH port. Environment secrets become available only to the deployment job.
Required reviewers can be added when releases need a manual approval, but leave them unset for fully automatic
deployment.
