#!/bin/sh
set -eu
while :; do
    sh /opt/rusys-backup/run.sh || echo backup failed >&2
    now=$(date +%s)
    delay=$((3600 - now % 3600))
    sleep "$delay" &
    wait $!
done
