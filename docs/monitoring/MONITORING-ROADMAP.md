# Monitoring roadmap

This roadmap organizes monitoring capabilities independently of a hosting provider. It is a planning guide; deployment
state and operational history belong in the environment's operations system. See the
[monitoring overview](MONITORING.md) for implementation guides.

## Capabilities

| Capability             | Diagnostic purpose                                           | Integration boundary                                   |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| External availability  | Detect unreachable applications and invalid health responses | Independent HTTP probes                                |
| Infrastructure metrics | Understand resource pressure and platform health             | Hosting provider or container/host integration         |
| Structured logs        | Inspect bounded application and request events               | Application logger and platform log pipeline           |
| Database metrics       | Detect connection pressure and operation changes             | Database provider or scoped exporter                   |
| Backend tracing        | Follow latency through application operations                | Runtime instrumentation and OTLP collector             |
| Frontend observability | Measure browser experience and client errors                 | Browser instrumentation with explicit privacy controls |
| Dashboards and alerts  | Correlate symptoms and notify responsible operators          | Observability backend and notification routing         |

## Implementation order

1. Define service, environment, and release identity, ownership, retention, and privacy requirements.
2. Add external checks so platform or collector outages are observable independently.
3. Connect supported infrastructure and database integrations using scoped credentials.
4. Export structured logs with bounded labels and sanitization at ingestion boundaries.
5. Trace important backend operations and verify parent/child timing under representative requests.
6. Add frontend telemetry only after defining permitted browser data and collection controls.
7. Build dashboards and alerts from verified signals, then exercise notification delivery.

## Moving between platforms

Preserve application identity, structured event names, span names, and privacy rules. Replace provider-specific resource
metrics, discovery, transport endpoints, and secret injection. Validate runtime support for database access, image
processing, storage, and instrumentation before selecting a deployment adapter.

Keep infrastructure settings in environment configuration. Application documentation should describe interfaces and
required behavior rather than individual machines, accounts, incidents, or completed installation steps.

## Acceptance

Each signal needs a destination-side query, representative traffic, and a defined failure indicator. Confirm bounded
resource use, restricted ingestion, and absence of sensitive content. Test alerts without disrupting production data,
and define retention and operating limits for the chosen observability service.

## Implementation and remaining acceptance

Reviewed on **2026-10-27** against the supplied implementation and recorded **2026-10-26** destination checks. This is
not a fresh production audit or a claim that another hosting target is deployed. The
[installation roadmap](MONITORING-ROADMAP.lt.md#12-atlikti-ir-likę-darbai) tracks detailed evidence, priorities and
installation-specific follow-up work.

- [x] Implement external page/health checks, infrastructure collection, structured logs and database monitoring.
- [x] Implement backend tracing with bounded service/release/slot identity and private collector transport.
- [x] Implement privacy-filtered frontend measurements, errors and bounded usage events.
- [x] Provide four dashboards, ten baseline alerts and a recorded successful provider send through a disposable
      query/evaluator/routing test.
- [x] Document the [retention assessment](RETENTION.md), provisional 14-day window and revisit triggers.
- [ ] Connect actual backup-job outcomes and an authoritative routed active-release signal to monitoring.
- [ ] Confirm notification receipt independently, the operator's required history and effective account retention.
- [ ] Record resilience, external probe failure/recovery, deployed permission/network-boundary and representative
      operation checks; validate rendered dashboards and tune thresholds against representative load.
- [ ] Revisit retention by **2026-11-09**, or sooner on a documented trigger. Implement and verify an independent daily
      aggregate archive only if longer history is required; no archive is currently deployed.

Session history/replay are intentionally excluded from the frontend privacy configuration. A future AWS, Cloudflare or
other platform migration is separate work; validate the new integration at its destination before transferring
completion status.
