# Dashboards and actionable alerts

The supplied Grafana Cloud bundle correlates external availability, NAS/container resources, gateway requests, MongoDB,
sampled backend traces and privacy-filtered browser events. It follows the [monitoring plan](MONITORING.md) and reuses
the configured contact point. Dashboard visibility, successful rule evaluation and notification delivery are separate
checks.

## Dashboard coverage

The four dashboards link to each other and preserve the selected time range. Queries select production Rusys telemetry;
cAdvisor additionally selects `name=~"rusys-.*"` because its `project` label also covers unrelated NAS containers.

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

The running-slot panel uses fresh cAdvisor observations. Startup logs identify the observed release of each slot,
including historical inactive slots. Neither signal independently proves which upstream NGINX currently routes to. There
is no authoritative active-release metric in the supplied collector; compare the deployment state when diagnosing a
rollout. The start-time change panel aggregates by container name before counting changes, so container IDs do not split
the history. Short-lived restarts between scrapes can still be missed.

## Baseline alert conditions

Definitions live in [baseline-alerts.json](../../docker/monitoring/baseline-alerts.json) and are generated from
[grafana-config.ts](../../scripts/grafana-config.ts). Every alert includes a summary, diagnostic action, dashboard link
and runbook link. Rules route directly to the existing contact point rather than replacing the stack's notification
policy. They group by folder/alert name, wait 30 seconds before notification, group updates every 5 minutes, and repeat
after 4 hours.

| Alert                           | Condition / pending duration                                                                                                             | First action                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Public endpoint unavailable     | No successful samples at any probe for an individual required check in 15m, with at least 3 samples per probe; no extra pending duration | Check DNS/TLS, NAS connectivity, NGINX and application; inspect Synthetic Monitoring   |
| Public check telemetry missing  | Either `rusys-homepage` or `rusys-health` has no samples in 20m                                                                          | Check check definitions, probe health and ingestion                                    |
| NAS memory pressure             | Available RAM below 15% of total for 10m                                                                                                 | Inspect container working sets, host services and swap                                 |
| Container memory pressure       | Working set above 85% of a finite nonzero configured limit for 5m                                                                        | Inspect the named container and workload; assess its configured limit                  |
| Filesystem capacity             | Used fraction above 80% for 15m on `/` or `/volume[0-9]+`                                                                                | Inspect volume usage, Docker storage and backup retention; never delete database files |
| Gateway telemetry missing       | No gateway log samples for 20m                                                                                                           | Check gateway access logging, Alloy discovery and Loki ingestion                       |
| API 5xx errors                  | More than 2% 5xx and at least 20 real API requests in each 5m window, sustained for 5m                                                   | Correlate failure events, gateway status, release/slot and backend traces              |
| API p95 latency                 | More than 1s and at least 20 real API requests in each 5m window, sustained for 10m                                                      | Inspect slow traces, MongoDB, image work and resource pressure                         |
| MongoDB monitoring unavailable  | Exporter `up` or database `mongodb_up` is zero or absent for 5m                                                                          | Check private discovery/connectivity and monitoring permissions                        |
| Backup stale, failed or missing | Last success older than 26h, latest run failed, or either required status metric absent, for 15m                                         | Inspect scheduler, exit status, destination and the backup metrics integration         |

Public check windows accommodate the currently configured five-minute check interval. The sample count is a metric
coverage guard, not a guarantee of distinct probe executions; compare check history during validation. Missing either
check is independently detected. Uptime percentages average available probe samples and must be interpreted alongside
coverage alerts.

API queries use NGINX's numeric `request_time`, aggregate parsed request fields away and exclude `/api/health` from both
numerators and denominators. Synthetic health traffic cannot satisfy the API alert gate. With real requests and no 5xx,
the error panel shows zero; without requests it remains empty. Rate alerts intentionally stay quiet below 20 requests
per 5m. External availability and gateway-coverage alerts provide separate coverage at low traffic. This traffic gate is
an initial operating choice, not a measured service-level objective.

Explicit absence expressions detect missing public-check, gateway, MongoDB and backup telemetry; these rules use a
normal missing-data state because their healthy expression may return an empty result. Public failure windows also use a
normal missing-data state while awaiting enough samples; the separate coverage rule detects missing checks. Host RAM and
disk use an alerting missing-data state. Empty container-limit/API windows are normal because containers may be
unlimited and API traffic can be absent; their missing-data state is normal. Evaluation errors use Grafana's error state
and should be investigated separately from threshold breaches.

On 2026-10-26, read-only destination queries found roughly 32% NAS RAM use, `/` at 20.55% used, and `/volume1` at 94.87%
used. The disk threshold remains 80%: raising it to hide existing pressure would defeat the alert. Only `rusys-traces`
had a configured memory limit (256 MiB); other observed Rusys containers reported zero/unlimited limits and are excluded
from the percentage alert. Non-health API traffic was 323 requests in 24h with p95 about 0.156s and no 5xx. These
readings justify a conservative 1s latency threshold and a traffic guard, but are not a full peak-load baseline. Revisit
thresholds after representative traffic and releases; preserve explicit traffic and duration guards.

Destination validation on 2026-10-26 accepted all 53 dashboard query requests and all 10 baseline alert expressions.
Seven synthetic-input checks against the live Loki query engine confirmed the API traffic gate, zero-error behavior, and
exact error/latency threshold boundaries. All four dashboards and ten baseline rules were provisioned and read back. All
ten evaluators reported healthy execution; disk capacity and missing backup telemetry entered their expected pending
states. The existing global notification policy was preserved.

The modern contact-point API test reported `status: success`. A disposable rule then exercised the Prometheus query,
Grafana threshold evaluator and automatic routing to the existing email contact. It reached `firing`, and Grafana
recorded a successful notification attempt at **2026-10-26 21:30:21 UTC**, without a delivery error. The disposable rule
was deleted afterward. Independent inbox receipt remains unconfirmed; provider-reported delivery does not prove inbox
arrival. Query acceptance also does not prove that every optional signal has data or establish visual/accessibility
behavior in the Grafana UI.

Repository validation passed: 3,088 tests (including 17 monitoring regressions), with four existing skips; project lint,
application typechecking and explicit strict typechecking of the provisioning scripts. Lint retained one existing
warning in the backend telemetry test. Independent code, security and accessibility reviews completed, with their
actionable findings corrected and re-reviewed.

## Backup telemetry contract

There is no scheduler backup-status metric in the current monitoring integration. MongoDB internal metrics containing
the word `backup` do not prove a scheduled application backup succeeded. The baseline backup rule therefore detects the
missing integration rather than silently claiming protection.

The rule expects these gauges with `project="rusys"`, `environment="production"`, `host="synology-ds923"`:

```text
rusys_backup_last_success_timestamp_seconds  # Unix seconds of last completed successful backup
rusys_backup_last_run_success                # 1 for the latest completed successful run, 0 for failure
```

Persist the last-success timestamp across failed runs and restarts; update the latest-run result only after a run
completes. Publish through the scheduler's supported private metrics/textfile integration. Do not export filenames,
credentials or backup contents. The 26h threshold assumes daily backups plus two hours of slack; align it with the
actual approved schedule before treating it as a backup service objective. Adding a backup producer or changing its
schedule is separate operational work.

## Provision and verify

Keep administration credentials in the private `.env.grafana.local` described in
[Synthetic Monitoring](SYNTHETIC-MONITORING.md). No ingestion secrets belong in dashboard JSON. The CLI discovers one
Prometheus, Loki and Tempo data source and verifies the existing contact point; it fails on ambiguity. When needed set
`GRAFANA_PROMETHEUS_UID`, `GRAFANA_LOKI_UID`, `GRAFANA_TEMPO_UID` and `GRAFANA_CONTACT_POINT`. It requires HTTPS and
refuses authenticated redirects. Defaults reuse contact point `Rusys uptime email`.

```sh
# Regenerate portable JSON from the builder; no remote access.
pnpm exec tsx scripts/grafana-monitoring.ts render
pnpm exec prettier --write docker/monitoring/dashboards docker/monitoring/baseline-alerts.json

# Read-only discovery, then explicit provisioning and read-back verification.
pnpm exec dotenv -e .env.grafana.local -- pnpm exec tsx scripts/grafana-monitoring.ts plan
pnpm exec dotenv -e .env.grafana.local -- pnpm exec tsx scripts/grafana-monitoring.ts apply
pnpm exec dotenv -e .env.grafana.local -- pnpm exec tsx scripts/grafana-monitoring.ts verify

# Sends a controlled test to every integration in the existing contact point.
pnpm exec dotenv -e .env.grafana.local -- pnpm exec tsx scripts/grafana-monitoring.ts test-contact

# Isolated configuration/client regressions: no Grafana credentials or production mutations.
pnpm exec vitest run --project server scripts/grafana-monitoring.test.ts
```

Provisioning owns the `rusys-monitoring` folder, the four dashboard UIDs, and the `rusys-baseline` rule group. Rerunning
updates these resources. It does not delete other dashboards, rules or contacts, or replace global routing. Application
is sequential and can partially succeed; fix the reported failure and rerun. Review the generated rules before applying:
disk pressure and missing backup telemetry can immediately become actionable alerts after their pending durations.
Manual dashboard imports use the data-source selectors; the CLI resolves the actual UIDs automatically.

`verify` checks persisted dashboard identity/folder and alert condition/routing; it does not establish live ingestion,
healthy evaluations or inbox receipt. Execute representative panel queries at the destination, inspect evaluated rules,
and open a backend trace. Test the contact point using the modern Grafana notification API (namespace and receiver
resource name are discovered). A successful API test means Grafana reported provider delivery; independently confirm the
message at the configured destination. Record the timestamp and result in the environment's operations record without
copying addresses or tokens into this repository. Exercise a disposable Grafana rule routed to the same contact to
verify evaluation and automatic routing, then remove it; never induce a production outage for an alert test.

References:
[Grafana alert provisioning API](https://grafana.com/docs/grafana/latest/developer-resources/api-reference/http-api/alerting_provisioning/),
[notification API migration](https://grafana.com/whats-new/2026-04-07-legacy-alertmanager-configuration-api-endpoints-changed/),
[Loki metric queries](https://grafana.com/docs/loki/latest/query/metric_queries/).
