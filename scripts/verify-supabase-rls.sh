#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

for cmd in initdb pg_ctl psql; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required PostgreSQL command: $cmd" >&2
    exit 1
  fi
done

PGDATA="$(mktemp -d "${TMPDIR:-/tmp}/shiftwell-rls-pgdata.XXXXXX")"
SOCKET_DIR="$(mktemp -d "${TMPDIR:-/tmp}/shiftwell-rls-socket.XXXXXX")"
LOG_FILE="$PGDATA/postgres.log"
PORT="${SHIFTWELL_RLS_TEST_PORT:-55432}"
STOPPED=0

cleanup() {
  if [[ "$STOPPED" -eq 0 ]]; then
    pg_ctl -D "$PGDATA" -m fast -w stop >/dev/null 2>&1 || true
  fi
  rm -rf "$PGDATA" "$SOCKET_DIR"
}
trap cleanup EXIT

initdb -D "$PGDATA" -A trust -U postgres --no-locale >/dev/null
pg_ctl \
  -D "$PGDATA" \
  -l "$LOG_FILE" \
  -o "-c listen_addresses='' -k $SOCKET_DIR -p $PORT" \
  -w start >/dev/null

cd "$ROOT_DIR"
psql \
  -h "$SOCKET_DIR" \
  -p "$PORT" \
  -U postgres \
  -d postgres \
  -v ON_ERROR_STOP=1 \
  -X \
  -f scripts/verify-supabase-rls-setup.sql

while IFS= read -r migration; do
  echo "Applying $(basename "$migration")"
  psql \
    -h "$SOCKET_DIR" \
    -p "$PORT" \
    -U postgres \
    -d postgres \
    -v ON_ERROR_STOP=1 \
    -X \
    -f "$migration"
done < <(find supabase/migrations -maxdepth 1 -type f -name '*.sql' | sort)

psql \
  -h "$SOCKET_DIR" \
  -p "$PORT" \
  -U postgres \
  -d postgres \
  -v ON_ERROR_STOP=1 \
  -X \
  -f scripts/verify-supabase-rls.sql

pg_ctl -D "$PGDATA" -m fast -w stop >/dev/null
STOPPED=1

echo "Supabase RLS verification PASS"
