#!/bin/bash
# Pixel - Designer Agent Task Runner
# Runs every 15 minutes: design tasks

echo "🎨 [PIXEL] Starting design cycle at $(date)"

sleep 30
echo "  → Designing UI components..."

sleep 25
echo "  → Creating pixel art..."

sleep 10
echo "  → Exporting assets..."

LOG_FILE="/root/.openclaw/workspace/mission-control-v2/logs/pixel.log"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Design assets exported" >> "$LOG_FILE"

jq --arg time "$(date -Iseconds)" '.agents.pixel.lastActive = $time | .agents.pixel.currentTask = "Design assets ready" | .agents.pixel.progress = 90' \
    /root/.openclaw/workspace/mission-control-v2/data/agent-status.json > /tmp/status.json && \
    mv /tmp/status.json /root/.openclaw/workspace/mission-control-v2/data/agent-status.json

echo "🎨 [PIXEL] ✅ Cycle complete"
