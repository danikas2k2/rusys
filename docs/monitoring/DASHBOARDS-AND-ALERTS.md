# Dashboards and actionable alerts

The supplied Grafana Cloud bundle correlates external availability, NAS/container resources, gateway requests, MongoDB,
sampled backend traces and privacy-filtered browser events. It follows the [monitoring plan](MONITORING.md) and reuses
the configured contact point. Dashboard visibility, successful rule evaluation and notification delivery are separate
checks.

## Dashboard coverage

The four dashboards link to each other and preserve the selected time range. Queries select production Rusys telemetry;
cAdvisor additionally selects `name=~"rusys-.*"` because its `project` label also covers unrelated NAS containers.

Panels are grouped by telemetry source. In **Drilldown > Metrics**, group by the `job` label or filter by prefixes such
as `node_`, `container_`, and `mongodb_`.

| Dashboard                                                                  | Signals                                                                                                                                                                                                      |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Rusys Overview](../../docker/monitoring/dashboards/overview.json)         | Public check success, sampled uptime over 24h/7d, NAS CPU/RAM, observed running app slot, observed slot/release startup logs, API 5xx/p95, MongoDB health, backup age                                        |
| [Infrastructure](../../docker/monitoring/dashboards/infrastructure.json)   | NAS CPU/memory, per-container CPU/working set/finite memory limit, peak working set in legend, persistent filesystem capacity, disk I/O, container network, observed start-time changes, scrape availability |
| [Application](../../docker/monitoring/dashboards/application.json)         | NGINX request volume/status/p95, non-health API volume/5xx/p95, application failures, MongoDB connection/operation rates, recent and slow backend traces                                                     |
| [Frontend & Usage](../../docker/monitoring/dashboards/frontend-usage.json) | Existing bounded usage events, confirmed data operations, forms/navigation/authentication, browser exceptions, LCP/INP/CLS p75 and collection/session limitations                                            |

No-data panels explicitly indicate missing collection or eligible activity. An empty browser panel does not establish
zero errors. Frontend session history is deliberately disabled; the random memory-only Faro session ID does not count
unique visitors. See [frontend observability](FRONTEND-OBSERVABILITY.md). The dashboard uses Faro app ID `8029`,
configurable in its app selector. LCP and INP are milliseconds; CLS is dimensionless.

The running-slot panel uses cAdvisor samples. Startup logs identify the slot's image version. Check deployment state for
the active Nginx upstream.

## Baseline alert conditions

Definitions live in [baseline-alerts.json](../../docker/monitoring/baseline-alerts.json) and are generated from
[grafana-config.ts](../../scripts/grafana-config.ts). Every alert includes a summary, diagnostic action, dashboard link
and runbook link. Rules route directly to the existing contact point rather than replacing the stack's notification
policy. They group by folder/alert name, wait 30 seconds before notification, group updates every 5 minutes, and repeat
after 4 hours, except the filesystem warning, which repeats after 24 hours.

| Alert                           | Condition / pending duration                                                                                                             | First action                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Public endpoint unavailable     | No successful samples at any probe for an individual required check in 15m, with at least 3 samples per probe; no extra pending duration | Check DNS/TLS, NAS connectivity, NGINX and application; inspect Synthetic Monitoring   |
| Public check telemetry missing  | Either `rusys-homepage` or `rusys-health` has no samples in 20m                                                                          | Check check definitions, probe health and ingestion                                    |
| NAS memory pressure             | Available RAM below 15% of total for 10m                                                                                                 | Inspect container working sets, host services and swap                                 |
| Container memory pressure       | Working set above 85% of a finite nonzero configured limit for 5m                                                                        | Inspect the named container and workload; assess its configured limit                  |
| Filesystem capacity             | Used fraction above 90% for 15m on `/` or `/volume[0-9]+`                                                                                | Inspect volume usage, Docker storage and backup retention; never delete database files |
| Filesystem capacity warning     | Used fraction above 85% and at most 90% for 15m on `/` or `/volume[0-9]+`; repeats every 24h                                             | Inspect the affected filesystem and plan capacity                                      |
| Gateway telemetry missing       | No gateway log samples for 20m                                                                                                           | Check gateway access logging, Alloy discovery and Loki ingestion                       |
| API 5xx errors                  | More than 2% 5xx and at least 20 real API requests in each 5m window, sustained for 5m                                                   | Correlate failure events, gateway status, release/slot and backend traces              |
| API p95 latency                 | More than 1s and at least 20 real API requests in each 5m window, sustained for 10m                                                      | Inspect slow traces, MongoDB, image work and resource pressure                         |
| MongoDB monitoring unavailable  | Exporter `up` or database `mongodb_up` is zero or absent for 5m                                                                          | Check private discovery/connectivity and monitoring permissions                        |
| Backup stale, failed or missing | Last success older than 2h, latest run failed, or either required status metric absent, for 15m                                          | Inspect scheduler, exit status, destination and the backup metrics integration         |

Public checks use five-minute probe intervals. API alerts use numeric NGINX `request_time` and exclude `/api/health`.
Dedicated rules detect missing probe, gateway, MongoDB, and backup telemetry.

## Backup telemetry contract

The [backup job](../BACKUP.md) publishes its status through Alloy's textfile collector. MongoDB internal metrics
containing the word `backup` do not prove a scheduled application backup succeeded. Until the job is deployed, the
baseline backup rule detects the missing integration rather than silently claiming protection.

The rule expects these gauges with `project="rusys"`, `environment="production"`, `host="synology-ds923"`:

```text
rusys_backup_last_success_timestamp_seconds  # Unix seconds of last completed successful backup
rusys_backup_last_run_success                # 1 for the latest completed successful run, 0 for failure
```

The job preserves the last-success timestamp across failed runs and restarts and updates the result on completion. It
does not export filenames, credentials or backup contents. The two-hour threshold allows one hour of slack for the
hourly schedule; review it against observed run durations before treating it as a service objective.

## Provision and verify

Keep administration credentials in the private `.env.grafana.local` described in
[Synthetic Monitoring](SYNTHETIC-MONITORING.md). No ingestion secrets belong in dashboard JSON. The CLI discovers one
Prometheus, Loki and Tempo data source and verifies the existing contact point; it fails on ambiguity. When needed set
`GRAFANA_PROMETHEUS_UID`, `GRAFANA_LOKI_UID`, `GRAFANA_TEMPO_UID` and `GRAFANA_CONTACT_POINT`. It requires HTTPS and
refuses authenticated redirects. Defaults reuse contact point `Rusys uptime email`.

```sh
# Regenerate portable JSON from the builder; no remote access.
pnpm grafana:render

# Read-only discovery, then explicit provisioning and read-back verification.
pnpm grafana:plan
pnpm grafana:apply
pnpm grafana:verify

# Sends a controlled test to every integration in the existing contact point.
pnpm grafana:test-contact

# Isolated configuration/client regressions: no Grafana credentials or production mutations.
pnpm exec vitest run --project server scripts/grafana-monitoring.test.ts
```

Provisioning owns the `rusys-monitoring` folder, the four dashboard UIDs, and the `rusys-baseline` rule group. Rerunning
updates these resources. It does not delete other dashboards, rules or contacts, or replace global routing. Application
is sequential and can partially succeed; fix the reported failure and rerun. Review the generated rules before applying:
disk pressure and missing backup telemetry can immediately become actionable alerts after their pending durations.
Manual dashboard imports use the data-source selectors; the CLI resolves the actual UIDs automatically.

After provisioning, run representative panel queries and inspect alert evaluation. Use `pnpm grafana:test-contact` to
test the configured destination. Use a disposable rule to verify automatic routing.

References:
[Grafana alert provisioning API](https://grafana.com/docs/grafana/latest/developer-resources/api-reference/http-api/alerting_provisioning/),
[Loki metric queries](https://grafana.com/docs/loki/latest/query/metric_queries/).
