#!/bin/sh
# Run from a trusted root-owned configuration file on the NAS.
set -eu
umask 077

if [ "$#" -ne 1 ] || [ ! -r "$1" ]; then
    echo "Usage: run.sh /path/to/private-backup.conf" >&2
    exit 2
fi
. "$1"
: "${RESTIC_REPOSITORY:?}" "${RESTIC_PASSWORD_FILE:?}" "${MONGO_BACKUP_CONFIG:?}" "${BACKUP_WORK_DIR:?}" "${BACKUP_IMAGES_DIR:?}"
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
METRICS_DIR=${BACKUP_METRICS_DIR:-/volume1/docker/rusys-app/backup-metrics}
mkdir -p "$BACKUP_WORK_DIR" "$METRICS_DIR"
chmod 700 "$BACKUP_WORK_DIR"
exec 9>"$BACKUP_WORK_DIR/lock"
if ! flock -n 9; then
    echo "A backup is already running" >&2
    exit 1
fi
last_success=0
if [ -r "$METRICS_DIR/backup.prom" ]; then
    last_success=$(awk '$1 == "rusys_backup_last_success_timestamp_seconds" && $2 ~ /^[0-9]+$/ { value=$2 } END { print value+0 }' "$METRICS_DIR/backup.prom")
fi
success=0
cleanup() {
    status=$?
    trap - EXIT HUP INT TERM
    rm -f "$BACKUP_WORK_DIR/mongodb.archive"
    if [ "$status" -ne 0 ]; then success=0; fi
    metrics_tmp="$METRICS_DIR/.backup.$$.tmp"
    if ! {
        printf '# TYPE rusys_backup_last_success_timestamp_seconds gauge\nrusys_backup_last_success_timestamp_seconds %s\n' "$last_success"
        printf '# TYPE rusys_backup_last_run_success gauge\nrusys_backup_last_run_success %s\n' "$success"
    } > "$metrics_tmp" || ! chmod 644 "$metrics_tmp" || ! mv -f "$metrics_tmp" "$METRICS_DIR/backup.prom"; then
        rm -f "$metrics_tmp"
        echo "Failed to publish backup metrics" >&2
        exit 1
    fi
    exit "$status"
}
trap cleanup EXIT
trap 'exit 1' HUP INT TERM

# Choose the scheduled mode before the dump can cross an hour boundary.
backup_start=$(date +%u-%H)
[ -d "$BACKUP_IMAGES_DIR" ]
[ -r "$MONGO_BACKUP_CONFIG" ]
docker exec -i rusys-db mongodump --config /dev/stdin --archive --oplog < "$MONGO_BACKUP_CONFIG" > "$BACKUP_WORK_DIR/mongodb.archive"
[ -s "$BACKUP_WORK_DIR/mongodb.archive" ]
# A weekly complete scan. Restic still deduplicates stored content.
if [ "$backup_start" = 7-02 ]; then
    sh "$script_dir/restic.sh" "$1" backup --force --tag rusys -- /backup/images /backup/work/mongodb.archive
else
    sh "$script_dir/restic.sh" "$1" backup --tag rusys -- /backup/images /backup/work/mongodb.archive
fi
sh "$script_dir/restic.sh" "$1" forget --tag rusys --keep-within 3m --prune
last_success=$(date +%s)
success=1
