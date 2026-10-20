# RUSYS monitoring

RUSYS uses Grafana Cloud for external uptime checks and NAS/Docker metrics. These are separate data paths:

| Path                                                                              | Current state                                                                                                                                                                                                                              | Guide                                                                               |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Synthetic Monitoring public probe → public site and `/api/health` → Grafana Cloud | Deployed: two Frankfurt HTTP checks every five minutes, an email alert after three failed executions in 15 minutes, and an uptime dashboard. A temporary failure check triggered a successfully delivered test notification on 2026-10-19. | [Synthetic Monitoring setup](SYNTHETIC-MONITORING.md)                               |
| Grafana Alloy on the NAS → host and Docker metrics → Grafana Cloud                | Alloy deployment is implemented; verify metric coverage in the target stack.                                                                                                                                                               | [Development and deployment](DEVELOPMENT-AND-DEPLOYMENT.md#deployment-and-rollback) |

The public probe checks RUSYS from outside the NAS. It continues to detect a site outage if Alloy is unavailable.
`/api/health` is a lightweight Next.js liveness route, so it does not require MongoDB or Alloy. The uptime dashboard
shows availability, last check time, response time, uptime over the selected range, and check/incident history.

The [original Lithuanian monitoring roadmap](MONITORING-ROADMAP.lt.md) is retained as a historical planning document.
Its stage statuses and checklist predate the Synthetic Monitoring deployment; use the current guides above for setup and
operational status.
