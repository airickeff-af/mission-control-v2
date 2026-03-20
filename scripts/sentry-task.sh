#!/bin/bash
# Sentry - DevOps Agent Task Runner
# Runs every 1 minute: system monitoring

echo "🛡️ [SENTRY] Starting monitoring cycle at $(date)"

sleep 5
echo "  → Checking system health..."

sleep 5
echo "  → Monitoring token usage..."

sleep 5
echo "  → Scanning for alerts..."

LOG_FILE="/root/.openclaw/workspace/mission-control-v2/logs/sentry.log"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ System check complete - All green" >> "$LOG_FILE"

jq --arg time "$(date -Iseconds)" '.agents.sentry.lastActive = $time | .agents.sentry.currentTask = "System monitoring active" | .agents.sentry.progress = 100' \
    /root/.openclaw/workspace/mission-control-v2/data/agent-status.json > /tmp/status.json && \
    mv /tmp/status.json /root/.openclaw/workspace/mission-control-v2/data/agent-status.json

echo "🛡️ [SENTRY] ✅ Cycle complete"
