#!/usr/bin/env bash

source "$(dirname "$0")/.rfvars.sh"

SERVER_PID=""
CLIENT_PID=""

cleanup() {
    trap - INT TERM EXIT

    echo
    echo "[rostify (dev)] Shutting down Rostify..."

    [[ -n "$SERVER_PID" ]] && kill "$SERVER_PID" 2>/dev/null
    [[ -n "$CLIENT_PID" ]] && kill "$CLIENT_PID" 2>/dev/null

    wait 2>/dev/null
}

trap cleanup INT TERM EXIT

echo "[rfdev] init > Initialising Rostify development environment:"

echo "[rfdev] init > (1/2) Initialising Rostify server..."
konsole --separate -p tabtitle="Rostify Server" -e bash -c "
    cd \"$RFSERVER\" || { echo 'Failed to cd into $RFSERVER'; read -rp 'Press Enter to close...'; exit 1; }
    bun run dev -l info --clearScreen false
    EXIT_CODE=\$?
    if [ \$EXIT_CODE -ne 0 ]; then
        echo
        echo \"[rostify (server)] Process exited with error code \$EXIT_CODE.\"
        read -rp 'Press Enter to close...'
    fi
" &
SERVER_PID=$!
echo "[rfdev] init > (1/2) Done."

echo "[rfdev] init > (2/2) Initialising Rostify client..."
konsole --separate -p tabtitle="Rostify Client" -e bash -c "
    cd \"$RFCLIENT\" || { echo 'Failed to cd into $RFCLIENT'; read -rp 'Press Enter to close...'; exit 1; }
    bun run dev -l info --clearScreen false
    EXIT_CODE=\$?
    if [ \$EXIT_CODE -ne 0 ]; then
        echo
        echo \"[rostify (client)] Process exited with error code \$EXIT_CODE.\"
        read -rp 'Press Enter to close...'
    fi
" &
CLIENT_PID=$!
echo "[rfdev] init > (2/2) Done."

wait