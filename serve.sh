#!/bin/bash
while true; do
  while ss -tlnp 2>/dev/null | grep -q ':3000 '; do sleep 0.5; done
  cd /home/z/my-project
  NODE_OPTIONS="--max-old-space-size=128" bun .next/standalone/server.js >> dev.log 2>&1
  sleep 1
done
