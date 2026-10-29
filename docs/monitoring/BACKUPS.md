# Restic backups

The NAS job backs up the production image directory and a consistent MongoDB archive together. The scheduler runs it
once an hour; Sunday at 02:00 it reads every file again with `--force`. Restic snapshots are individually restorable and
deduplicate content even during the weekly full scan. The database archive is a complete dump on every run, while Restic
deduplicates its content. Retention keeps every snapshot within three months of the latest snapshot, then prunes unused
data. If backups stop, retention does not advance until the job runs again.

This repository provides the job and collector configuration; it does not create a repository, install a NAS scheduler,
provision secrets, or deploy Grafana rules. Use a separate storage destination and test recovery before relying on it.
Docker and `flock` must be available on the NAS, and `mongodump` must be available in `rusys-db`. The job runs the
official `ghcr.io/restic/restic:0.18.1` image as a short-lived container; Restic is not required on the NAS host. Pull
the image before scheduling and ensure the NAS architecture is supported:

```sh
docker pull ghcr.io/restic/restic:0.18.1
```

Run the job as a dedicated trusted account with access to Docker, the image files, private configuration, work directory
and destination. Docker access is privileged. Keep all configuration and credentials owned by that account with mode
0600 and their directories restricted. Protect the repository password separately from the repository and keep a
recovery copy.

Prepare a private mongodump YAML configuration containing `uri: "mongodb://..."` with an authorized backup account and
`authSource`; do not pass the URI on the command line. The account needs MongoDB's backup privileges, including oplog
access. Validate the replica-set dump with `--oplog` against the actual server before scheduling. This dumps all
databases; do not use a database-limited URI. The dump is temporarily stored unencrypted in the private work directory,
so use a protected encrypted volume with enough capacity. A sudden power loss or SIGKILL can leave this file behind;
inspect and remove it after an interruption.

Create a trusted shell configuration outside the repository, for example:

```sh
RESTIC_REPOSITORY='destination configured for Restic'
RESTIC_PASSWORD_FILE='/secure/restic-password'
MONGO_BACKUP_CONFIG='/secure/mongodump.yaml'
BACKUP_WORK_DIR='/secure/rusys-backup-work'
BACKUP_IMAGES_DIR='/volume1/docker/rusys-app/images'
# Optional, for a repository on a mounted filesystem:
# BACKUP_REPOSITORY_DIR='/path/to/dedicated/repository'
# Optional, for remote backend credentials:
# RESTIC_ENV_FILE='/secure/restic-backend.env'
```

For a local repository set `RESTIC_REPOSITORY='/repository'` and `BACKUP_REPOSITORY_DIR` to an existing, dedicated host
directory. For a remote repository use its Restic URL and omit `BACKUP_REPOSITORY_DIR`. Put any backend-specific
credentials in the optional Docker env file as `NAME=value` lines, with no `export` or shell quoting. Docker passes
these values to the container; Docker administrators can inspect container environment variables. Do not put credentials
in the image or Git. The password file is mounted read-only at a fixed container path. The container hostname and source
paths stay fixed across runs so Restic can find its parent snapshot; snapshots made by an earlier host-based job have
different paths and host identity. The work directory must be separate from the image directory and the Restic
repository. Do not place secrets or the repository inside the images directory. The job sources the shell configuration
as code, so never allow untrusted users to modify it. Docker bind mount source paths must be absolute and must not
contain commas. The wrapper supports network backends configured through environment variables; SFTP requiring SSH keys
or custom host-key configuration requires additional container mounts and is not configured here.

Create the image source, work and optional local repository directories, then initialize the dedicated repository once
(do not run `init` against an existing repository):

```sh
sh /path/to/rusys/scripts/backup/restic.sh /secure/backup.conf init
```

Configure one hourly NAS Task Scheduler job, including Sunday 02:00, with an absolute path to the checked-out script:

```sh
sh /path/to/rusys/scripts/backup/run.sh /secure/backup.conf
```

Use the NAS local time zone. A lock prevents overlapping runs. The weekly scan occurs only if the scheduled run starts
during Sunday 02:00; check job history after NAS downtime or daylight-saving changes. A failed dump, backup or retention
operation reports failure. Each run writes the last successful completion time and latest result atomically to
`/volume1/docker/rusys-app/backup-metrics/backup.prom`; Alloy reads this path through its existing read-only host mount.
The overview dashboard shows backup age and the baseline alert detects failures, missing telemetry, or success older
than two hours after a 15-minute pending period. Allow for actual backup duration when assessing this threshold. If the
job cannot write its metrics, the previous result remains and the stale alert eventually fires.

Restic applies the retention window separately to each snapshot group (host and paths by default), relative to that
group's newest snapshot. If migrating from the host-based job, its old group no longer receives snapshots and its
retention window will not advance. After confirming that the new container snapshots are complete and restorable,
inspect the host, paths, timestamps, tags and IDs with the `snapshots` command below. For each old-group snapshot that
has passed its required three-month retention, first preview and then remove only that specific snapshot ID:

```sh
sh /path/to/rusys/scripts/backup/restic.sh /secure/backup.conf forget --dry-run SNAPSHOT_ID
sh /path/to/rusys/scripts/backup/restic.sh /secure/backup.conf forget SNAPSHOT_ID
```

Replace `SNAPSHOT_ID` with the verified ID each time. Do not select snapshots belonging to other groups or still within
their retention period. To reclaim unreferenced data, run the wrapper with `prune` during a maintenance window when no
backup or other repository operation is running; `forget --prune` in the scheduled job may skip pruning if its policy
removes no snapshots. No broad snapshot deletion is needed.

Before enabling the scheduler, manually run the job, verify both metrics in Grafana, and restore a snapshot into an
isolated location. The wrapper exposes the work directory as `/backup/work` for recovery output:

```sh
sh /path/to/rusys/scripts/backup/restic.sh /secure/backup.conf snapshots
sh /path/to/rusys/scripts/backup/restic.sh /secure/backup.conf check
sh /path/to/rusys/scripts/backup/restic.sh /secure/backup.conf restore latest --target /backup/work/restore
```

The restored host paths are `BACKUP_WORK_DIR/restore/backup/images` and
`BACKUP_WORK_DIR/restore/backup/work/mongodb.archive`. Restore the MongoDB archive into a disposable replica set using
`mongorestore --archive --oplogReplay`; check application data and image files. Remove the recovery directory securely
after testing; it contains unencrypted application data. The database dump and image snapshot are captured at different
times and do not form a cross-system transactional snapshot. Repeat recovery checks and the `check` command
periodically. Keep the operational log free of credentials and data; Restic output may include source paths.

References: [Restic backup and snapshots](https://restic.readthedocs.io/en/stable/040_backup.html),
[Restic retention](https://restic.readthedocs.io/en/stable/060_forget.html),
[Restic Docker image](https://restic.readthedocs.io/en/stable/020_installation.html#docker-container),
[MongoDB mongodump](https://www.mongodb.com/docs/database-tools/mongodump/).
