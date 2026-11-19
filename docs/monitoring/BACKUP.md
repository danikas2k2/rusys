# Backup monitoring

The [backup guide](../BACKUP.md) covers the job, repository, deployment, and recovery.

The job writes `backup.prom` atomically to the shared metrics directory. Alloy must scrape that directory. Grafana
displays the last success age and alerts for a failed run, missing metrics, or success older than two hours after a
15-minute pending period. Confirm both `rusys_backup_last_success_timestamp_seconds` and `rusys_backup_last_run_success`
in Grafana Explore. Test failure, stale and missing signals in an isolated environment before relying on alerts.

On the NAS, inspect `BACKUP_METRICS_DIR/backup.prom` and verify its success timestamp and result. In the monitoring
container, confirm the file is readable under the configured Alloy textfile directory. In Grafana Explore, query
`rusys_backup_last_success_timestamp_seconds{project="rusys"}` and `rusys_backup_last_run_success{project="rusys"}` and
check that their host label matches the alert selector. Check the backup alert's evaluation state and separately confirm
delivery to the configured contact. Use a separate test instance to exercise failed, stale, and missing metrics rather
than overwriting production status files.

For the default NAS paths, use the following checks after the first completed backup:

```sh
cat /volume1/docker/rusys-app/backup-metrics/backup.prom
docker exec rusys-monitoring cat /rootfs/volume1/docker/rusys-app/backup-metrics/backup.prom
docker exec rusys-monitoring grep -A 2 'textfile {' /etc/alloy/config.alloy
```

The first two commands should show the same success timestamp and `rusys_backup_last_run_success 1`. If the first file
is missing, inspect `docker logs rusys-backup`, the service mounts, and the job result. If only the second is missing,
check the Alloy host mount and filesystem permissions. The Alloy textfile directory must match the path visible inside
the monitoring container; an overridden `BACKUP_METRICS_DIR` requires an equivalent Alloy configuration change. After
changing Alloy configuration, validate it and restart the monitoring service.
