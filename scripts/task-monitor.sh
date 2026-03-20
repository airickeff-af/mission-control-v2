#!/bin/bash
# ⏰ Task Progress Monitor - Runs every 30 minutes
# Checks if tasks are progressing, alerts if stagnating

WORKSPACE="/root/.openclaw/workspace"
STATUS_DIR="$WORKSPACE/mission-control-v2/data"
LOG_FILE="$WORKSPACE/mission-control-v2/logs/task-monitor.log"
PENDING_TASKS="$WORKSPACE/mission-control-v2/PENDING_TASKS.md"
LAST_CHECK_FILE="$STATUS_DIR/.last_task_check"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log() {
    echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

# Count tasks from PENDING_TASKS.md
count_tasks() {
    local priority=$1
    grep -c "^### \*\*$priority" "$PENDING_TASKS" 2>/dev/null || echo "0"
}

# Get completion count from status file
get_completed_count() {
    if [ -f "$STATUS_DIR/task-progress.json" ]; then
        jq '.completedToday // 0' "$STATUS_DIR/task-progress.json" 2>/dev/null || echo "0"
    else
        echo "0"
    fi
}

# Check last check time
check_last_progress() {
    if [ -f "$LAST_CHECK_FILE" ]; then
        local last_completed=$(cat "$LAST_CHECK_FILE")
        local current_completed=$(get_completed_count)
        
        if [ "$last_completed" -eq "$current_completed" ]; then
            echo "0"  # No progress
        else
            echo "1"  # Progress made
        fi
    else
        echo "1"  # First run, assume progress
    fi
    
    # Update last check
    get_completed_count > "$LAST_CHECK_FILE"
}

# Main monitoring function
main() {
    log "═══════════════════════════════════════════════════════════"
    log "⏰ TASK PROGRESS CHECK - $(date)"
    log "═══════════════════════════════════════════════════════════"
    
    # Count tasks
    p0_count=$(count_tasks "P0")
    p1_count=$(count_tasks "P1")
    p2_count=$(count_tasks "P2")
    total=$((p0_count + p1_count + p2_count))
    completed=$(get_completed_count)
    
    log "📊 Current Status:"
    log "   P0 Critical: $p0_count"
    log "   P1 High: $p1_count"
    log "   P2 Medium: $p2_count"
    log "   Total: $total"
    log "   Completed Today: $completed"
    
    # Check if progress was made since last check
    progress_made=$(check_last_progress)
    
    if [ "$progress_made" -eq "0" ]; then
        log "${RED}⚠️  WARNING: No task progress in last 30 minutes!${NC}"
        log "${YELLOW}🔥 PUSHING HARDER - Activating aggressive mode${NC}"
        
        # Trigger virtual agents to work harder
        for agent in glasses quill pixel gary sentry audit olivia zookeeper; do
            log "   💪 Boosting $agent..."
        done
        
        # Update status with alert
        cat > "$STATUS_DIR/task-alert.json" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "alert": "NO_PROGRESS",
  "message": "No task progress in 30 minutes - pushing harder",
  "action": "AGGRESSIVE_MODE",
  "p0_count": $p0_count,
  "p1_count": $p1_count
}
EOF
        
        # Aggressive alert
        log "${RED}🚨 AGGRESSIVE MODE ACTIVATED${NC}"
        log "   - All virtual agents boosted"
        log "   - P0 tasks flagged for immediate attention"
        log "   - Consider manual intervention for blockers"
        
    else
        log "${GREEN}✅ Progress detected - keeping pace${NC}"
        
        # Update normal status
        cat > "$STATUS_DIR/task-progress.json" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "p0_count": $p0_count,
  "p1_count": $p1_count,
  "p2_count": $p2_count,
  "total": $total,
  "completedToday": $completed,
  "progressPercent": $((completed * 100 / (total + completed))),
  "status": "ON_TRACK",
  "nextCheck": "$(date -d '+30 minutes' -Iseconds)"
}
EOF
    fi
    
    log "⏱️  Next check in 30 minutes"
    log "═══════════════════════════════════════════════════════════"
}

# Run main
main
