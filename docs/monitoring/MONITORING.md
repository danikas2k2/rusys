# RUSYS monitoring

Grafana Cloud receives telemetry from Alloy, external probes, and Grafana Faro.

| Signal                 | Purpose                                                    | Guide                                                                               |
| ---------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| External HTTP checks   | Availability and response time from outside the deployment | [Synthetic Monitoring](SYNTHETIC-MONITORING.md)                                     |
| Infrastructure metrics | Resource usage and infrastructure health                   | [Deployment integrations](../DEVELOPMENT-AND-DEPLOYMENT.md#monitoring-integrations) |
| Structured logs        | Bounded operational events and request diagnostics         | [Logging](DOCKER-LOGGING.md)                                                        |
| Database metrics       | Connections, operation rates, and database health          | [MongoDB metrics](MONGODB-METRICS.md)                                               |
| Backup status          | Scheduled backup success, freshness, and alerts            | [Backup monitoring](BACKUP.md)                                                      |
| Backend traces         | Request timing and nested application operations           | [Backend tracing](BACKEND-TRACING.md)                                               |
| Frontend diagnostics   | Browser errors, web vitals, and bounded usage events       | [Frontend observability](FRONTEND-OBSERVABILITY.md)                                 |
| Dashboards and alerts  | Cross-signal diagnosis and actionable notifications        | [Dashboards and alerts](DASHBOARDS-AND-ALERTS.md)                                   |

## Deployment

- [Collector configuration](../DEVELOPMENT-AND-DEPLOYMENT.md#monitoring-integrations)
- [Grafana provisioning](DASHBOARDS-AND-ALERTS.md#provision-and-verify)
