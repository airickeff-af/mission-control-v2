#!/bin/bash
# ============================================
# 🌅 MORNING COMMAND BRIEF GENERATOR
# Updates the morning brief with fresh data
# Run daily at 6:00 AM via cron
# ============================================

WORKSPACE="/root/.openclaw/workspace"
BRIEF_FILE="$WORKSPACE/mission-control-v2/morning-brief.html"
LIMITLESS_DIR="$WORKSPACE/agents/limitless"
DATE=$(date +%Y-%m-%d)
TIME=$(date +"%I:%M %p")

# Colors for logging
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}[MORNING BRIEF]${NC} Generating brief for $DATE at $TIME"

# Function to get trading stats
get_trading_stats() {
    local db_file="$LIMITLESS_DIR/trade_database.json"
    
    if [ -f "$db_file" ]; then
        # Get today's trades
        local today=$(date +%Y-%m-%d)
        local trades=$(grep -c "$today" "$db_file" 2>/dev/null || echo "0")
        
        # Get total stats
        local total_pnl=$(grep -o '"totalPnL": [^,]*' "$db_file" | tail -1 | awk '{print $2}')
        local total_trades=$(grep -o '"totalTrades": [^,]*' "$db_file" | tail -1 | awk '{print $2}')
        local wins=$(grep -o '"wins": [^,]*' "$db_file" | tail -1 | awk '{print $2}')
        
        if [ -z "$total_pnl" ]; then total_pnl="0"; fi
        if [ -z "$total_trades" ]; then total_trades="0"; fi
        if [ -z "$wins" ]; then wins="0"; fi
        
        echo "$total_pnl|$total_trades|$wins"
    else
        echo "0|0|0"
    fi
}

# Function to get top priorities from task file
get_priorities() {
    local tasks_file="$WORKSPACE/mission-control-v2/PENDING_TASKS.md"
    
    if [ -f "$tasks_file" ]; then
        # Extract P0 tasks (top 3)
        grep -A2 "### \*\*KAIRO-" "$tasks_file" | grep -E "KAIRO-0[1-3]:" | head -3 | sed 's/.*KAIRO-/KAIRO-/' | sed 's/: /**/'
    fi
}

# Get trading stats
IFS='|' read -r total_pnl total_trades wins <<< "$(get_trading_stats)"

# Calculate win rate
if [ "$total_trades" -gt "0" ]; then
    win_rate=$(echo "scale=1; ($wins / $total_trades) * 100" | bc)
else
    win_rate="0"
fi

# Determine P&L color
if (( $(echo "$total_pnl >= 0" | bc -l) )); then
    pnl_class="positive"
    pnl_sign="+"
else
    pnl_class="negative"
    pnl_sign=""
fi

# Generate dynamic content for the brief
cat > /tmp/brief_update.js << EOF
// Update trading stats
document.getElementById('tradePnl').textContent = '${pnl_sign}\$${total_pnl}';
document.getElementById('tradePnl').className = 'stat-value ${pnl_class}';
document.getElementById('tradeCount').textContent = '${total_trades}';
document.getElementById('winRate').textContent = '${win_rate}%';

// Update greeting based on time
const hour = new Date().getHours();
let greeting = '🌅 GOOD MORNING, COMMANDER';
if (hour >= 12 && hour < 17) greeting = '☀️ GOOD AFTERNOON, COMMANDER';
if (hour >= 17) greeting = '🌙 GOOD EVENING, COMMANDER';
document.querySelector('.greeting').textContent = greeting;

// Update last updated
document.getElementById('lastUpdated').textContent = '${TIME} GMT+8';
EOF

# Update the brief file with new data
sed -i "s/id=\"tradePnl\">.*</id=\"tradePnl\">\${pnl_sign}\$\${total_pnl}</" "$BRIEF_FILE"
sed -i "s/id=\"tradeCount\">.*</id=\"tradeCount\">\${total_trades}</" "$BRIEF_FILE"
sed -i "s/id=\"winRate\">.*</id=\"winRate\">\${win_rate}%</" "$BRIEF_FILE"

echo -e "${GREEN}[MORNING BRIEF]${NC} Updated with:"
echo "  - Trading P&L: ${pnl_sign}\$${total_pnl}"
echo "  - Total Trades: ${total_trades}"
echo "  - Win Rate: ${win_rate}%"

# Commit changes
cd "$WORKSPACE"
git add "$BRIEF_FILE" 2>/dev/null
git commit -m "🌅 Morning Brief Update - ${DATE} ${TIME}" 2>/dev/null || true

echo -e "${GREEN}[MORNING BRIEF]${NC} Complete!"
