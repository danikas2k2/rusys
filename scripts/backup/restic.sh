#!/bin/sh
# Run Restic with stable paths and hostname, including for maintenance operations.
set -eu
if [ "$#" -lt 2 ] || [ ! -r "$1" ]; then
    echo "Usage: restic.sh /path/to/private-backup.conf RESTIC_COMMAND [ARGS...]" >&2
    exit 2
fi
config=$1
shift
. "$config"
: "${RESTIC_REPOSITORY:?}" "${RESTIC_PASSWORD_FILE:?}" "${BACKUP_WORK_DIR:?}" "${BACKUP_IMAGES_DIR:?}"
export RESTIC_REPOSITORY

# Fixed container paths and hostname allow Restic to find its parent snapshot.
set -- ghcr.io/restic/restic:0.18.1 "$@"
set -- --rm --hostname rusys-backup \
    --mount "type=bind,src=$RESTIC_PASSWORD_FILE,dst=/run/secrets/restic-password,readonly" \
    --mount "type=bind,src=$BACKUP_IMAGES_DIR,dst=/backup/images,readonly" \
    --mount "type=bind,src=$BACKUP_WORK_DIR,dst=/backup/work" \
    --env RESTIC_REPOSITORY --env RESTIC_PASSWORD_FILE=/run/secrets/restic-password \
    "$@"
if [ -n "${RESTIC_ENV_FILE:-}" ]; then
    set -- --env-file "$RESTIC_ENV_FILE" "$@"
fi
if [ -n "${BACKUP_REPOSITORY_DIR:-}" ]; then
    set -- --mount "type=bind,src=$BACKUP_REPOSITORY_DIR,dst=/repository" "$@"
fi
exec docker run "$@"
