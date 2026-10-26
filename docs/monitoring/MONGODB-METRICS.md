# MongoDB metrics

Database monitoring complements application traces with connection counts, operation rates, and database health. Use the
database provider's monitoring integration or an exporter that can reach the database over a private, authenticated
connection. [Monitoring overview](MONITORING.md).

## Access and credentials

Use separate identities for application access, monitoring, and administration. The monitoring identity must not have
application data read/write permissions. For the repository's MongoDB exporter, use only the built-in `clusterMonitor`
role on `admin`; expand privileges only for a documented metric that requires them.

Authentication must be enforced by the database service. Creating an account or adding credentials to a connection
string does not itself enable access control. Manage database authentication and replica-set configuration through the
database platform's supported provisioning process.

Store credentials in the target environment's secret manager. In the supplied Compose deployment, `DB_MONITORING_URI` is
a deployment-side secret passed only to the monitoring service:

```dotenv
DB_MONITORING_URI='mongodb://MONITOR_USER:ENCODED_PASSWORD@db.example.com/admin?authSource=admin'
```

Percent-encode reserved characters in credentials. Keep application credentials in `DB` separate from the monitoring
URI. Do not commit secrets, embed them in images, print resolved deployment configuration, or expose them to browser
code. Restrict access to local secret files when using file-based configuration.

## Collector integration

The supplied [Alloy configuration](../../docker/monitoring/config.alloy) uses Docker discovery to identify the database
on its private bridge network. It reconstructs the connection from the discovered address and monitoring credentials,
uses direct connections, and follows container address changes. Its discovery filters are coupled to the supplied
Compose project; adapt discovery when changing the deployment topology.

Only diagnostic-data collection is enabled. Collection, index, profile, and other broad collectors are disabled.
Credentials, documents, query text, and personal identifiers must not appear in exported metrics or labels.

A managed database may provide equivalent metrics directly. In that case, configure its integration and credentials
rather than exposing a database port or duplicating a host-level exporter. Keep database and collector administrative
interfaces private regardless of hosting provider.

The current [deployment script](../../scripts/deploy.ts) checks that unauthenticated `serverStatus` is rejected and that
the monitoring secret exists before activating monitoring. Provision database access before running that deployment; the
script is not a database authentication migration tool.

## Verification

Validate collector configuration, then confirm that the monitoring identity can execute `serverStatus` and
`getDiagnosticData`. Check that application reads/writes using that identity, incorrect passwords, and unauthenticated
administrative commands are rejected. Use disposable data for permission probes.

In the configured Prometheus-compatible data source, inspect:

```promql
up{project="rusys",job="integrations/mongodb"}
mongodb_up{project="rusys",job="integrations/mongodb"}
mongodb_ss_connections{project="rusys",job="integrations/mongodb",conn_type="current"}
sum by (legacy_op_type) (rate(mongodb_ss_opcounters{project="rusys",job="integrations/mongodb"}[5m]))
```

Adapt selectors to the integration's labels. `up=1` confirms the exporter is reachable; `mongodb_up=1` confirms its
database connection. Check actual metric names and labels before building dashboards. Compare activity over several
scrapes, and verify that database restarts or address changes do not interrupt collection permanently.

The repository includes an isolated security and discovery regression using disposable local containers:

```sh
RUN_DOCKER_TESTS=1 pnpm exec vitest run scripts/mongodb-monitoring.test.ts
```

References: [MongoDB built-in roles](https://www.mongodb.com/docs/manual/reference/built-in-roles/),
[Alloy MongoDB exporter](https://grafana.com/docs/alloy/latest/reference/components/prometheus/prometheus.exporter.mongodb/).
