# RUSYS monitoring

Monitoring should follow the application across hosting providers. Collect service identity, release, and environment
consistently; choose infrastructure integrations that match the target platform.

| Signal                 | Purpose                                                    | Guide                                                                               |
| ---------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| External HTTP checks   | Availability and response time from outside the deployment | [Synthetic Monitoring](SYNTHETIC-MONITORING.md)                                     |
| Infrastructure metrics | Resource usage and infrastructure health                   | [Deployment integrations](../DEVELOPMENT-AND-DEPLOYMENT.md#monitoring-integrations) |
| Structured logs        | Bounded operational events and request diagnostics         | [Logging](DOCKER-LOGGING.md)                                                        |
| Database metrics       | Connections, operation rates, and database health          | [MongoDB metrics](MONGODB-METRICS.md)                                               |
| Backend traces         | Request timing and nested application operations           | [Backend tracing](BACKEND-TRACING.md)                                               |
| Dashboards and alerts  | Cross-signal diagnosis and actionable notifications        | [Dashboards and alerts](DASHBOARDS-AND-ALERTS.md)                                   |

The supplied deployment uses Grafana Cloud and Alloy. External HTTP checks run independently of application-side
collectors. Logs, metrics, and traces use separate credentials and ingestion paths; validate each signal at its
destination rather than treating a running collector as proof of successful ingestion.

## Hosting boundaries

Application spans and structured events describe application behavior. Container discovery, host exporters, network
addresses, and secret injection belong to the deployment integration. When moving to a managed platform, replace those
integrations with the platform's supported telemetry interfaces while preserving privacy and service identity.

The supplied Docker network, SSH deployment commands, and host metrics collection apply to the repository's container
deployment. They are not prerequisites for every hosting target. See the
[deployment guide](../DEVELOPMENT-AND-DEPLOYMENT.md#deployment-targets) before selecting another runtime.

## Acceptance checks

- External checks verify the public application and `/api/health` without depending on an internal collector.
- Logs are structured and exclude credentials, personal data, and unrestricted request content.
- Metrics have bounded labels and reflect the relevant infrastructure and database activity.
- Traces identify the service, environment, release, and deployment slot where applicable.
- Collector and database interfaces remain private or authenticated.
- Alert routing is tested independently of dashboard visibility.

The [Lithuanian installation roadmap](MONITORING-ROADMAP.lt.md) remains the working plan for the current installation.
The [general monitoring roadmap](MONITORING-ROADMAP.md) describes capabilities for other deployment targets.
