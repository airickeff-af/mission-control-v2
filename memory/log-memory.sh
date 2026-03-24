#!/bin/bash
# ============================================
# 📅 DAILY MEMORY LOGGER
# Auto-log conversations and work sessions
# ============================================

WORKSPACE="/root/.openclaw/workspace"
MEMORY_DIR="$WORKSPACE/memory"
MC_MEMORY="$WORKSPACE/mission-control-v2/memory"
DATE=$(date +%Y-%m-%d)
TIME=$(date +"%I:%M %p")
DAY=$(date +%A)
LOG_FILE="$MEMORY_DIR/${DATE}.md"

# Colors
CYAN='\033[0;36m'
PINK='\033[1;35m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${PINK}📅 DAILY MEMORY LOGGER${NC}"
echo -e "${CYAN}========================================${NC}"
echo "Date: $DATE ($DAY)"
echo "Time: $TIME GMT+8"
echo ""

# Function to create new log
create_new_log() {
    cat > "$LOG_FILE" << EOF
# 📅 Daily Memory Log - $DATE
**Day:** $DAY  
**Session Start:** $TIME GMT+8  
**Status:** 🟢 Active

---

## 🎯 Today's Focus
[To be filled during session]

---

## 💬 Discussions & Conversations

### Discussion 1: [Topic]
**Time:** $TIME  
**Summary:**  
[Auto-logged from conversation]

**Key Points:**
- 

**Decisions Made:**
- 

---

## ✅ Tasks Completed

| Task | Project | Status | Notes |
|------|---------|--------|-------|
| | | | |

---

## 🔄 Work In Progress

| Task | Project | Status | Blockers |
|------|---------|--------|----------|
| | | | |

---

## 🚧 Blockers & Issues

*None recorded yet*

---

## 💡 Insights & Learnings

*To be captured*

---

## 📊 Metrics & Status

| Metric | Value | Change |
|--------|-------|--------|
| | | |

---

## 🔗 References & Links

- 

---

## 📝 Session Notes

\`\`\`
[Raw notes from conversation]
\`\`\`

---

**Logged by:** Nexus  
**Log ID:** mem-${DATE}-001  
**Tags:** #daily-log #${DATE} #nexus

---

*Part of the Daily Memory System*
EOF
    
    echo -e "${GREEN}✅ Created new daily log: $LOG_FILE${NC}"
}

# Function to append to existing log
append_to_log() {
    local section="$1"
    local content="$2"
    
    echo "" >> "$LOG_FILE"
    echo "### $section - $TIME" >> "$LOG_FILE"
    echo "$content" >> "$LOG_FILE"
    
    echo -e "${GREEN}✅ Appended to log: $section${NC}"
}

# Check if log exists
if [ ! -f "$LOG_FILE" ]; then
    echo -e "${YELLOW}📄 No log found for today. Creating new log...${NC}"
    create_new_log
else
    echo -e "${GREEN}📄 Daily log exists: $LOG_FILE${NC}"
fi

# Menu
echo ""
echo "What would you like to do?"
echo "1) View today's log"
echo "2) Add discussion entry"
echo "3) Add task completion"
echo "4) Add blocker/issue"
echo "5) Add insight/learning"
echo "6) Sync to Mission Control"
echo "7) Exit"
echo ""
read -p "Select option (1-7): " choice

case $choice in
    1)
        cat "$LOG_FILE"
        ;;
    2)
        read -p "Discussion topic: " topic
        read -p "Summary: " summary
        append_to_log "Discussion: $topic" "$summary"
        ;;
    3)
        read -p "Task name: " task
        read -p "Project: " project
        append_to_log "Task Completed: $task" "Project: $project"
        ;;
    4)
        read -p "Blocker description: " blocker
        read -p "Project: " project
        append_to_log "Blocker: $blocker" "Project: $project"
        ;;
    5)
        read -p "Insight/learning: " insight
        append_to_log "Learning" "$insight"
        ;;
    6)
        cp "$LOG_FILE" "$MC_MEMORY/"
        echo -e "${GREEN}✅ Synced to Mission Control memory${NC}"
        ;;
    7)
        echo -e "${CYAN}Goodbye!${NC}"
        exit 0
        ;;
    *)
        echo -e "${YELLOW}Invalid option${NC}"
        ;;
esac

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${PINK}Memory logging complete!${NC}"
echo -e "${CYAN}========================================${NC}"
