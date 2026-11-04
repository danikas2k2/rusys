FROM rclone/rclone:1.71.2 AS rclone
FROM ghcr.io/restic/restic:0.18.1
COPY --from=rclone /usr/local/bin/rclone /usr/local/bin/rclone
