# Docker logs in Grafana Cloud Loki

Alloy collects stdout/stderr from the `rusys-app` Compose project, including both application slots, MongoDB, the
gateway, and Alloy itself. Collection follows container recreation through Docker discovery. Stopped slots retain their
previously ingested history; they produce new logs only while running.

## Credentials and deployment

Keep `GC_LOKI_URL`, `GC_LOKI_USER`, and `GC_LOKI_TOKEN` only in the NAS Compose `.env`. The URL must be the Grafana
Cloud Loki push endpoint ending in `/loki/api/v1/push`; the username is the logs instance ID, and the token needs
`logs:write`. Compose passes these values only to `monitoring`. Do not copy them into application environment files,
source code, images, or browser variables. The existing Grafana administration credential in `.env.grafana.local` is
separate and is used only for administration and read-only verification.

The existing deployment command uploads and validates Alloy configuration before recreating monitoring and building the
inactive application slot. Follow the [deployment guide](../DEVELOPMENT-AND-DEPLOYMENT.md#deployment-and-rollback). Both
slots need to be rebuilt through normal blue/green deployments before both use the new application logger. Restarting an
old image does not add logging instrumentation. Never stop the whole Compose project to update Alloy.

## Privacy and useful context

The Node logger emits one JSON object per line with timestamp, severity, a static event name, `service`, `slot`, and
release `version`. Slots come from each Compose service's runtime environment. The version comes from `APP_VERSION`
baked into the image, so rollback retains the previous release's identity.

Logging uses an allowlist: arbitrary strings, request objects, headers, cookies, tokens, user data, error messages, and
stacks are omitted. Add diagnostic context through bounded enums and validated numeric fields. Do not pass personal data
to the logger. Runtime console calls are reduced to static events before application output is emitted.

Alloy applies a second privacy boundary before writing to Cloud. Framework output and service logs that cannot be proven
safe become structured redaction events. Infrastructure diagnostics retain only explicitly selected fields; raw
access-log URLs, IP addresses, MongoDB attributes, and arbitrary messages never reach Loki. This deliberately limits
free-text debugging: a redaction event indicates that output occurred, but cannot recover its original text. Existing
local Docker logs are outside this export policy and may still contain historical raw service output.

| Source        | Searchable diagnostic fields                                                                                    |
| ------------- | --------------------------------------------------------------------------------------------------------------- |
| Application   | Static startup, API failure, request failure, and redaction events; allowed HTTP method, route type, and status |
| MongoDB       | Bounded severity and numeric message ID                                                                         |
| Nginx gateway | Allowed HTTP method and status                                                                                  |
| Alloy         | Bounded log level                                                                                               |

Unrecognized fields are omitted. Unknown raw output still produces a JSON redaction event rather than disappearing.

Only bounded deployment and container context belongs in indexed labels. Release versions, request IDs, user IDs, URLs,
and payload fields must never become labels. Use JSON parsing at query time for allowed event fields.

## Verify in Grafana Explore

Open [Grafana Explore](https://purplecheetah2525.grafana.net/explore), select `grafanacloud-purplecheetah2525-logs`, and
use a time range containing a deployment. Synthetic Monitoring also uses `project="rusys"`, so select Docker containers
explicitly when verifying this pipeline.

```logql
{project="rusys", container=~"rusys-app-(blue|green)"}
```

```logql
{project="rusys", container="rusys-app-blue"} | json
```

```logql
{project="rusys", container="rusys-app-green"} | json
```

```logql
{project="rusys", container=~"rusys-(db|gateway|monitoring)"} | json
```

Check that both slots appear with their own container label and correct JSON slot/version fields. Confirm each exported
line parses as JSON and inspect its field names and allowed values. Avoid printing raw production logs to terminal
output while verifying privacy. Check that release versions and personal identifiers are absent from stream labels.
After recreating Alloy, confirm fresh entries still arrive; its persistent storage preserves Docker positions.

If entries are missing, inspect the loopback Alloy status UI through an SSH tunnel and check Docker discovery,
processing, and Loki write component health. A healthy container alone does not prove Cloud ingestion. Verify the NAS
credentials and token scope without printing their values. Grafana queries use the data source's read access; the NAS
token needs only write access.

On first activation, Docker discovery may replay older container history. Loki can reject entries outside its allowed
timestamp window with HTTP 400. Confirm fresh entries arrive and distinguish this initial backfill rejection from
recurring write failures.

## Verification record

On 2026-10-24, two normal blue/green deployments rebuilt both application slots. Grafana's Loki query API returned
structured entries for `rusys-app-blue`, `rusys-app-green`, `rusys-db`, `rusys-gateway`, and `rusys-monitoring`. Both
application slots emitted `server_started` with their own slot and version `4.2.10`. A 1,000-entry production sample
contained only allowed fields, values, and stored labels; every line parsed as JSON. The LogQL JSON parsing query above
also succeeded. These queries were validated through Grafana's data-source API; the Explore UI was not manually
exercised. Blue was healthy and active after rollout, Green was stopped normally, and public `/api/health` returned HTTP
200 with `{"status":"ok"}` and `Cache-Control: no-store`.

Local validation passed all 2,857 tests, TypeScript, formatting, ESLint, Stylelint, and the production build. The pinned
Alloy image validated the configuration. Isolated real-Alloy fixtures verified privacy filtering, Docker discovery, both
application slots' stdout/stderr, and exclusion of unrelated containers and sensitive Docker labels. Independent code
and security reviews found no actionable issues; accessibility review found no user-facing impact.

The pipeline follows the official
[Docker collection guide](https://grafana.com/docs/alloy/latest/monitor/monitor-docker-containers/) and
[Loki processing reference](https://grafana.com/docs/alloy/latest/reference/components/loki/loki.process/).
