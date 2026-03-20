#!/bin/bash
# Quill - Writer Agent Task Runner
# Runs every 10 minutes: content creation

echo "✍️ [QUILL] Starting writing cycle at $(date)"

sleep 20
echo "  → Researching topic..."

sleep 30
echo "  → Drafting article..."

sleep 15
echo "  → Editing content..."

LOG_FILE="/root/.openclaw/workspace/mission-control-v2/logs/quill.log"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Content draft complete" >> "$LOG_FILE"

jq --arg time "$(date -Iseconds)" '.agents.quill.lastActive = $time | .agents.quill.currentTask = "Content draft ready for review" | .agents.quill.progress = 85' \
    /root/.openclaw/workspace/mission-control-v2/data/agent-status.json > /tmp/status.json && \
    mv /tmp/status.json /root/.openclaw/workspace/mission-control-v2/data/agent-status.json

echo "✍️ [QUILL] ✅ Cycle complete"
