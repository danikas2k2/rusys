FROM rclone/rclone:1.71.2 AS rclone
FROM ghcr.io/restic/restic:0.18.1 AS restic
FROM mongo:8.0
COPY --from=rclone /usr/local/bin/rclone /usr/local/bin/rclone
COPY --from=restic /usr/bin/restic /usr/local/bin/restic
COPY scripts/backup/run.sh scripts/backup/scheduler.sh /opt/rusys-backup/
ENV RESTIC_PASSWORD_FILE=/run/secrets/restic-password RCLONE_CONFIG=/run/secrets/rclone.conf
ENV BACKUP_WORK_DIR=/backup/work BACKUP_IMAGES_DIR=/backup/images BACKUP_METRICS_DIR=/backup/metrics MONGO_BACKUP_CONFIG=/run/secrets/mongodump.yaml
ENTRYPOINT ["/bin/sh", "/opt/rusys-backup/scheduler.sh"]
