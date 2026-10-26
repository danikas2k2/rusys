# Monitoring retention decision

## Decision and required history

**Decision date: 2026-10-26. Retain the 14-day monitoring baseline for current diagnostics; defer a daily aggregate
archive. Review by 2026-11-09, or immediately on any trigger below.**

This is an operational decision under an explicit assumption: the current requirement is recent incident diagnosis and
short release comparisons. The [dashboard bundle](DASHBOARDS-AND-ALERTS.md) uses 24-hour and 7-day views. Neither the
[monitoring plan](MONITORING-ROADMAP.md) nor the current guides specify a monthly report, seasonal comparison,
compliance period, or dated migration-sizing exercise. No metric therefore has an established requirement beyond 14 days
today. This assumption has not been confirmed by the operator; a requested longer window supersedes it.

The installation roadmap makes a separate archive conditional on needing 3–12 months of resource history. Deferral is
based on the documented use of history, not storage availability or cost. Fourteen days cannot support monthly growth
analysis, quarterly release comparisons, seasonal peaks, or a historical migration baseline; those capabilities are
intentionally unavailable under this decision.

[Grafana's published Free tier](https://grafana.com/pricing/) lists 14-day retention for metrics, logs and traces. This
decision uses that conservative planning window; it does not verify this stack's effective entitlement. Previously
observed stack metadata identified a trial. The operator should check account-specific retention and trial expiry in
Grafana Cloud before relying on a different period. No account plan or retention setting is changed here.

## Signal assessment

The table separates the current need from proposed windows to adopt only when the associated requirement is confirmed.
Existing time-series retention does not imply that daily aggregates are already materialized.

| Signal                                | Current need and available source                                                                                                      | When longer history is required                                                                                     |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| CPU p95 and max                       | Up to 14 days of host/container samples for pressure and recent release diagnosis                                                      | 90 days for recurring capacity or release comparisons; 12 months for seasonal sizing                                |
| RAM p95 and max                       | Up to 14 days of available-memory/working-set samples; limits only where configured                                                    | 90 days for sustained-growth analysis; 12 months for seasonal sizing                                                |
| Request count                         | Up to 14 days of bounded NGINX access logs for recent load and incidents                                                               | 90 days for traffic trends or release normalization; 12 months for seasonality                                      |
| API p95                               | Up to 14 days of numeric NGINX request durations, excluding `/api/health`                                                              | 90 days for release performance trends; 12 months if seasonal comparisons are needed                                |
| Database size                         | No established historical window; MongoDB health/activity is collected, but an application database-size series has not been validated | Validate a size source, then retain 90 days for growth/migration sizing; 12 months for seasonal growth              |
| Image-storage size                    | No established historical window and no verified image-size gauge; images live under configurable `IMAGES_DIR`                         | Add a size source, then retain 90 days for growth/migration sizing; 12 months for seasonal growth                   |
| Logs, traces and frontend diagnostics | Up to 14 days for current investigations; no longer raw-data requirement identified                                                    | Reassess for a concrete investigation, privacy or compliance requirement; do not automatically archive raw payloads |

Source definitions are in the [dashboard builder](../../scripts/grafana-config.ts), [MongoDB guide](MONGODB-METRICS.md)
and [image storage implementation](../../src/server/data/images.ts). A NAS filesystem used-space value is not an
application database-size or image-storage-size measurement. Request counts are not unique users. Backend traces are
sampled and must not substitute for gateway request counts or latency distributions.

The observed 94.9% usage of `/volume1` requires operational attention now. It does not establish historical growth or
justify a forecast from a single observation. This decision does not resolve that capacity incident, create backups, or
set backup retention; backup status and recovery policy are separate concerns.

## Revisit triggers

The service operator should review this decision by **2026-11-09**, after a first full 14-day observation window, and
immediately when any of these occurs:

- The operator requests a window longer than 14 days, or a release/incident comparison crosses the retained window.
- Monthly reporting, recurring capacity forecasts, storage-growth planning or seasonal comparisons become required.
- An AWS, Cloudflare or other migration-sizing exercise is scheduled. Start capture at least 90 days before the sizing
  decision if a 90-day baseline is required; record an explicit shorter-baseline limitation if less time is available.
- A contractual, audit, privacy or compliance requirement changes the permissible or required history.
- The account's retention changes, the trial ends, or a review finds that necessary evidence expired before diagnosis.

At review, record the question being answered, the required look-back window, the signal list and an accountable
operator. If a trigger requires longer history, activate the archive before treating that requirement as covered.
Expired telemetry cannot be recovered by later enabling aggregates or increasing retention. Capture can preserve only
the still-retained source window and subsequent observations; missing days must remain explicit gaps.

## Archive activation requirements

No aggregate job, external bucket, scheduler or long-term records are created by this decision. When longer history is
confirmed, implement and verify the following before declaring the archive operational:

1. Store daily, versioned records in a separate long-term account/storage destination, with a scheduler outside the NAS
   and independent of Grafana's retention. Keep records readable as portable JSON or CSV without Grafana. Source
   adapters may query Grafana initially; replace those adapters when moving platforms rather than moving the archive.
2. Use complete UTC days `[00:00, next 00:00)`, stable logical service/environment/resource identities, explicit units
   (CPU cores or a documented normalized fraction, RAM/storage bytes, durations seconds), source and aggregation
   versions, sample/request counts and coverage status. Do not make NAS paths, container IDs or vendor IDs the only
   identity. Keep missing values null with a reason; never turn missing collection into zero.
3. Compute CPU/RAM p95 and max from samples at a documented cadence; sampled maxima can miss peaks between samples.
   Compute request count and API p95 over the day's eligible gateway requests, excluding health probes from API
   performance. Do not average daily p95 values to claim a monthly p95; retain mergeable distributions if that later
   becomes necessary. Count requests independently of whether they satisfy the alert's traffic gate.
4. Validate application database size and image-storage size separately. Record whether each is logical data size,
   allocated storage, end-of-day size or daily maximum; retain comparable definitions across migrations. Exclude
   credentials, raw requests, personal identifiers, documents and image contents from records.
5. Select the confirmed 90-day or 12-month retention policy, scoped credentials, retry/backfill limits and idempotent
   day/resource keys. Test external write/read-back, a subsequent scheduled daily run, incomplete-day handling and
   stale/missing archive notifications. Verify reading records independently of NAS/Grafana before acceptance.

Until activation is verified, the acceptance path is the documented 14-day decision above, not an independent archive.
