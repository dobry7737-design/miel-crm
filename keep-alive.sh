#!/bin/bash
# Keep-alive watchdog for Next.js dev server
while true; do
  if ! pgrep -f "next dev" > /dev/null 2>&1; then
    echo "[$(date)] Server died, restarting..." >> /tmp/keep-alive.log
    cd /home/z/my-project
    nohup bun run dev > /tmp/next-server.log 2>&1 &
    disown
    echo "[$(date)] Server restarted (PID: $!)" >> /tmp/keep-alive.log
  fi
  sleep 3
done
