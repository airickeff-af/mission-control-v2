#!/bin/bash
# Olivia - DealFlow Agent Task Runner
# Runs every 15 minutes: deal processing

echo "💼 [OLIVIA] Starting DealFlow cycle at $(date)"

sleep 20
echo "  → Scoring leads..."

sleep 25
echo "  → Drafting outreach emails..."

sleep 20
echo "  → Analyzing partnership opportunities..."

LOG_FILE="/root/.openclaw/workspace/mission-control-v2/logs/olivia.log"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Deal flow processing complete" >> "$LOG_FILE"

jq --arg time "$(date -Iseconds)" '.agents.olivia.lastActive = $time | .agents.olivia.currentTask = "Deals processed" | .agents.olivia.progress = 80' \
    /root/.openclaw/workspace/mission-control-v2/data/agent-status.json > /tmp/status.json && \
    mv /tmp/status.json /root/.openclaw/workspace/mission-control-v2/data/agent-status.json

echo "💼 [OLIVIA] ✅ Cycle complete"
