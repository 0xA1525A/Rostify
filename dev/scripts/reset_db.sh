#!/usr/bin/env bash

source "$(dirname "$0")/.rfvars.sh"

DATABASE_NAME="rostify_db"
DDL_FILE="${RFDATABASE}/migrations/rostify_db.sql"
SEED_FILE="${RFDATABASE}/migrations/seed.sql"

if [[ ! -f "$DDL_FILE" || ! -f "$SEED_FILE" ]]; then
    echo "[rfdev] > Error: Database migration files not found."
    exit 1
fi

echo "[rfdev] > Resetting database: ${DATABASE_NAME}"

echo "[rfdev] > (1/2) Executing DDL..."
psql -q -v ON_ERROR_STOP=1 -d "$DATABASE_NAME" -f "$DDL_FILE"

echo "[rfdev] (2/2) Executing seed data..."
psql -q -v ON_ERROR_STOP=1 -d "$DATABASE_NAME" -f "$SEED_FILE"

echo "[rfdev] Database reset completed successfully."
