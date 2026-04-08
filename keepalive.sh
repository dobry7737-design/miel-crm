#!/bin/bash
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting server..." >> dev.log
  NODE_OPTIONS='--max-old-space-size=256' bun .next/standalone/server.js >> dev.log 2>&1
  echo "[$(date)] Server exited, restarting in 2s..." >> dev.log
  sleep 2
done
