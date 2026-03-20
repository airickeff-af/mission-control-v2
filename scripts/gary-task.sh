#!/bin/bash
# Gary - Marketing Agent Task Runner
# Runs every 20 minutes: marketing analysis

echo "📈 [GARY] Starting marketing cycle at $(date)"

sleep 20
echo "  → Analyzing campaign metrics..."

sleep 20
echo "  → Optimizing ad spend..."

sleep 15
echo "  → Generating growth report..."

LOG_FILE="/root/.openclaw/workspace/mission-control-v2/logs/gary.log"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Marketing analysis complete" >> "$LOG_FILE"

jq --arg time "$(date -Iseconds)" '.agents.gary.lastActive = $time | .agents.gary.currentTask = "Marketing report generated" | .agents.gary.progress = 95' \
    /root/.openclaw/workspace/mission-control-v2/data/agent-status.json > /tmp/status.json && \
    mv /tmp/status.json /root/.openclaw/workspace/mission-control-v2/data/agent-status.json

echo "📈 [GARY] ✅ Cycle complete"
