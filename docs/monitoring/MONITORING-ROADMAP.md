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
