# MongoDB metrics

Alloy's built-in MongoDB exporter scrapes every 15 seconds into the existing Grafana Cloud Prometheus pipeline.
Production activation is pending: the NAS currently runs MongoDB without authorization. Creating a user alone does not
restrict an unauthenticated server. Deployment refuses to activate monitoring until unauthenticated `serverStatus` fails
with Unauthorized (`13`).

## Private network path

Alloy keeps host networking for NAS metrics, so Compose DNS is unavailable. Docker discovery uses the existing local
socket and accepts only project `rusys-app`, service `rusys-db`, container `/rusys-db`, network `rusys-app_rusys-net`,
and private port `27017`. The exporter connects to the discovered bridge IP; `direct_connect` avoids replica-set
redirects to Compose hostnames. Discovery refreshes every 15 seconds and follows IP changes. A missing container uses
closed loopback port `1` and reports the database unavailable. Update these exact identifiers together if the project
changes.

MongoDB has no published port. The exporter uses Alloy's in-memory HTTP transport and needs no separate listener. The
existing status UI remains on NAS loopback. Keep NAS firewall/router access to ports `27017` and `12345` closed. Do not
publish even a loopback database port: the NAS runs Docker 24.0.2, and Docker documents
[same-L2 access to loopback publications before version 28](https://docs.docker.com/engine/network/port-publishing/).
SCRAM authenticates the same-host bridge connection; this path does not provide TLS against a privileged NAS/network
administrator. The NAS, Docker socket, bridge, and attached containers remain trusted infrastructure. Use SSH/VPN for
remote administration without opening database or metrics ports publicly.

## Authorization rollout prerequisite

Enabling MongoDB authorization changes application authentication and requires explicit approval under `AGENTS.md`.
Complete a separately reviewed rollout before deploying:

1. Back up the database, verify recovery, and inventory clients and replica-set settings.
2. Create an administrative account, a separate application account limited to its database, and the monitor below.
3. Update both application slots' NAS-only `DB` URI. Configure persistent replica-set internal authentication (protected
   keyfile or equivalent) and authorization in Compose. Existing data volumes do not rerun image initialization
   variables. The current Compose database command does not enable auth; changing only the live container would be
   reverted.
4. Restart MongoDB in a maintenance window. Verify primary health and application reads/writes. Prove unauthenticated
   operations and application access using the monitor are rejected.
5. Set the monitoring URI in NAS `.env`, validate, and activate Alloy. Deployment checks authorization and the required
   NAS secret before uploading files. It checks authorization again after database reconciliation and health succeeds,
   stopping on failure before recreating monitoring.

Do not deploy this configuration as a substitute for the authorization rollout or revert to unauthenticated MongoDB.

## Dedicated account and NAS secret

In an authenticated administrative `mongosh` session on the NAS, create the account on `admin`. Enter the password
interactively; never place a real password in shell commands, repository files, screenshots, or Grafana queries.

```javascript
use admin
db.createUser({
  user: "rusys-monitoring",
  pwd: passwordPrompt(),
  roles: [{ role: "clusterMonitor", db: "admin" }]
})
```

Inspect an existing account before rotation. Its direct roles must be exactly `clusterMonitor` on `admin`, with no
additional grants or inherited custom roles. Authenticate as the monitor and verify `serverStatus` and
`getDiagnosticData` succeed. Verify an application `find` fails with Unauthorized; use a disposable database for a
denied-write probe. A wrong password and unauthenticated `serverStatus` must fail too. Never test writes on production
documents.

Only diagnostic-data collection is enabled. `collect_all=false` overrides broader exporter defaults; collection, index,
profile, and PBM collectors and compatibility duplicates remain disabled. `clusterMonitor` provides the `serverStatus`
and `getDiagnosticData` privileges for health, connections, and operation counters. No application read role or `read`
on `local` is required by this collector set. Expand privileges only for a documented additional metric after reviewing
data exposure. See the
[Alloy exporter reference](https://grafana.com/docs/alloy/latest/reference/components/prometheus/prometheus.exporter.mongodb/)
and
[MongoDB built-in roles](https://www.mongodb.com/docs/manual/reference/built-in-roles/#mongodb-authrole-clusterMonitor).

Store the URI only in the NAS deployment directory's `.env` (placeholders below):

```dotenv
MONGODB_MONITORING_URI='mongodb://rusys-monitoring:<percent-encoded-password>@rusys-db:27017/admin?authSource=admin&serverSelectionTimeoutMS=3000&connectTimeoutMS=3000'
```

Use a standard `mongodb://username:password@rusys-db:27017/admin` URI. Alloy extracts and re-encodes only its
credentials; it reconstructs the discovered private address, admin authentication source, and three-second connection
timeouts. Supplied hosts, paths, and options cannot redirect the connection. Percent-encode reserved username/password
characters. Single quotes prevent Compose interpolation in the example. The value goes only to monitoring and is marked
as an Alloy secret. Restrict NAS `.env` to its owner (`0600`); never upload a workstation copy or print expanded Compose
config. Container administrators can still inspect environment variables.

## Validation and Grafana Explore

Run `docker compose --env-file .env -f docker/compose.yaml config --quiet` and normal deployment's Alloy validation.
Expanded Compose output contains secrets: retain `--quiet`. Inspect the loopback Alloy UI through SSH if needed. A
running container or `up=1` confirms exporter HTTP availability; `mongodb_up=1` confirms database connectivity.

In Grafana Explore's Prometheus data source, select a recent 15-minute range:

```promql
up{project="rusys",job="integrations/mongodb",instance="rusys-db"}
mongodb_up{project="rusys",job="integrations/mongodb",instance="rusys-db"}
mongodb_ss_connections{project="rusys",job="integrations/mongodb",instance="rusys-db",conn_type="current"}
sum by (legacy_op_type) (rate(mongodb_ss_opcounters{project="rusys",job="integrations/mongodb",instance="rusys-db"}[5m]))
```

Both availability queries must return `1`. Confirm connection trends and operation rates during normal application
activity over multiple scrapes. Zero rates while idle are valid. Inspect returned labels before building panels since
exporter details vary with MongoDB version. Credentials, document bodies, and query strings must not appear in metrics
or sanitized Alloy logs. Confirm `docker port rusys-db` returns no bindings and test ports `27017` and `12345` are
unreachable from another LAN host and the public network. Record production results only after these checks; production
Explore verification remains pending.

The pinned exporter can log duplicate `opLatencies` histogram errors with MongoDB 8 diagnostic data. The isolated
regression verifies successful HTTP scrapes and the required connection/operation series despite those errors; it does
not establish coverage of every diagnostic histogram. Check the NAS MongoDB version's actual series before using
additional metrics, and investigate exporter compatibility before enabling more collectors or privileges.

Run the isolated security/discovery regression using disposable local Docker containers and no production credentials:

```sh
RUN_DOCKER_TESTS=1 pnpm exec vitest run scripts/mongodb-monitoring.test.ts
```
