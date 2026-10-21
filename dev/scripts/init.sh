
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

echo "[rostify (dev)] Initialising Rostify development environment:"

echo "[rostify (dev)] (1/2) Initialising Rostify server..."
konsole --separate -p tabtitle="Rostify Server" -e bash -c "
    cd \"$RFSERVER\" || exit 1
    exec bun run src/index.ts -l info --clearScreen false
" &
SERVER_PID=$!
echo "[rostify (dev)] (1/2) Done."

echo "[rostify (dev)] (2/2) Initialising Rostify client..."
konsole --separate -p tabtitle="Rostify Client" -e bash -c "
    cd \"$RFCLIENT\" || exit 1
    exec bun run dev -l info --clearScreen false
" &
CLIENT_PID=$!
echo "[rostify (dev)] (2/2) Done."

wait
