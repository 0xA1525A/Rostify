#!/usr/bin/env bash

source "$(dirname "$0")/.rfvars.sh"

echo "[RF:DEV] Setting up Rostify development environment:"
echo "[RF:DEV] (1/2) Setting up client dependencies..."
cd "$RFCLIENT" || exit 1
bun install    || exit 1
echo "[RF:DEV] (1/2) Done."

echo "[RF:DEV] (2/2) Setting up server dependencies..."
cd "$RFSERVER" || exit 1
bun install    || exit 1
echo "[RF:DEV] (2/2) Done."