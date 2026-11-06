# Restic backups

The `rusys-backup` container runs a backup at startup and at each subsequent hourly boundary. Sunday at 02:00 the job
forces a complete file scan. Restic snapshots are individually restorable and deduplicated; every snapshot within three
months of the latest snapshot is retained. Jobs do not overlap. Long jobs can skip hourly boundaries and a weekly scan
if they span Sunday 02:00; monitor duration and job history. The scheduler does not catch up after downtime.

The container includes MongoDB database tools, Restic and rclone. It connects to MongoDB over the Compose network and
does not need access to the Docker socket. The backup account needs MongoDB backup privileges including oplog access.
The database archive and image directory are captured at different times and are not a cross-system transactional
snapshot.

## Configuration and deployment

Set the following variables in the existing NAS Compose `.env`, replacing placeholders with absolute paths.
`RESTIC_REPOSITORY` must identify the existing repository; do not initialize it again.

```dotenv
RESTIC_REPOSITORY=rclone:REMOTE_NAME:PATH_TO_EXISTING_REPOSITORY
BACKUP_IMAGES_DIR=/volume1/docker/rusys-app/images
BACKUP_WORK_DIR=/volume1/docker/rusys-app/backup-work
BACKUP_METRICS_DIR=/volume1/docker/rusys-app/backup-metrics
BACKUP_SECRETS_DIR=/volume1/docker/rusys-app/backup-secrets
TZ=Europe/Vilnius
```

For another environment, change these paths and follow the [backup monitoring guide](monitoring/BACKUP.md) to configure
the metrics directory. Keep the work directory on an encrypted volume: MongoDB dumps are temporarily stored there
unencrypted, and an interruption can leave a dump behind. Provide enough space for a complete dump and restore. Keep
directories separate and restrict access. The container runs as root, so ensure the mounted directories have appropriate
permissions.

Place these existing private files in `BACKUP_SECRETS_DIR` (mode 0600, restricted directory): `restic-password` (the
repository password), `rclone.conf` (the existing rclone configuration), and `mongodump.yaml` (a YAML `uri` for an
authorized backup user). The MongoDB hostname in the URI must resolve from the container, e.g. `rusys-db`, and the
connection must be able to reach the replica set. Protect the Restic password separately from the repository. rclone
obscures FTP passwords rather than encrypting them; prefer FTPS. Do not commit these files. An encrypted rclone
configuration needs additional configuration for `RCLONE_CONFIG_PASS`; it is not provided by this Compose service.

Build and start from the deployed checkout, using the same Compose environment file as the application:

```sh
docker compose -f docker/compose.yaml --profile backup up -d --build backup
```

The container starts a job immediately. During migration, disable the NAS scheduled backup task before starting the
container, and ensure no old job is running; re-enable it if the container deployment fails. Verify the container logs,
a new snapshot, the two metrics and an isolated restore before relying on the new scheduler. The backup image is built
separately during deployment; ordinary application deployments do not update it automatically. After updates to backup
scripts or image, rebuild and recreate the service with the command above.

```sh
docker logs rusys-backup
docker exec rusys-backup restic snapshots
docker exec rusys-backup restic check
docker exec rusys-backup restic restore latest --target /backup/work/restore/test
```

Restore the MongoDB archive from `BACKUP_WORK_DIR/restore/test/backup/work/mongodb.archive` into a disposable replica
set with `mongorestore --archive --oplogReplay`; check both database data and images. Delete test restores securely.
`pnpm backup:list` and `pnpm backup:restore` use SSH and execute Restic inside the running backup container. Restic
operations can lock the repository; avoid maintenance operations while a backup is running.

For metrics, alerts, and verification, see [Backup monitoring](monitoring/BACKUP.md).

Existing snapshots from a different host or source paths form a different retention group; their three-month window will
not advance when that group no longer receives snapshots. Inspect `restic snapshots`, verify successful restoration and
expiry, and remove only verified old snapshot IDs with `restic forget --dry-run ID` followed by `restic forget ID`.
Reclaim unreferenced data with `restic prune` in a maintenance window.

References: [Restic backup and snapshots](https://restic.readthedocs.io/en/stable/040_backup.html),
[Restic retention](https://restic.readthedocs.io/en/stable/060_forget.html),
[rclone FTP configuration](https://rclone.org/ftp/),
[Restic rclone backend](https://restic.readthedocs.io/en/stable/030_preparing_a_new_repo.html#rclone),
[Restic Docker image](https://restic.readthedocs.io/en/stable/020_installation.html#docker-container),
[MongoDB mongodump](https://www.mongodb.com/docs/database-tools/mongodump/).
