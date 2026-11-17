#!/usr/bin/env bash

source "$(dirname "$0")/.rfvars.sh"

echo "[rfdev] setup > Setting up Rostify development environment:"
echo "[rfdev] setup > (1/2) Setting up client dependencies..."
cd "$RFCLIENT" || exit 1
bun install    || exit 1
echo "[rfdev] setup > (1/2) Done."

echo "[rfdev] setup > (2/2) Setting up server dependencies..."
cd "$RFSERVER" || exit 1
bun install    || exit 1
echo "[rfdev] setup > (2/2) Done."