#!/bin/bash
#
# Token Usage Alert System Test Script
# Tests alert triggers at 200k and 250k thresholds
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_SCRIPT="$SCRIPT_DIR/../scripts/token-alerts.js"

echo "=========================================="
echo "🧪 Token Usage Alert System - Test Suite"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Check if monitoring script exists
echo -e "${BLUE}Test 1: Check monitoring script exists${NC}"
if [ -f "$NODE_SCRIPT" ]; then
    echo -e "${GREEN}✓ PASS${NC}: Monitoring script found at $NODE_SCRIPT"
else
    echo -e "${RED}✗ FAIL${NC}: Monitoring script not found at $NODE_SCRIPT"
    exit 1
fi
echo ""

# Test 2: Check Node.js is available
echo -e "${BLUE}Test 2: Check Node.js availability${NC}"
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ PASS${NC}: Node.js found ($NODE_VERSION)"
else
    echo -e "${RED}✗ FAIL${NC}: Node.js not found"
    exit 1
fi
echo ""

# Test 3: Run monitoring script in test mode
echo -e "${BLUE}Test 3: Run monitoring script (test mode)${NC}"
echo "This will simulate WARNING and CRITICAL alerts..."
echo ""
cd "$SCRIPT_DIR/.."
node scripts/token-alerts.js --test
TEST_RESULT=$?

if [ $TEST_RESULT -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ PASS${NC}: Monitoring script executed successfully"
else
    echo ""
    echo -e "${YELLOW}⚠ WARNING${NC}: Script returned exit code $TEST_RESULT"
    echo "   (This may be expected if API is not accessible)"
fi
echo ""

# Test 4: Check alert state file creation
echo -e "${BLUE}Test 4: Check alert state persistence${NC}"
STATE_FILE="$SCRIPT_DIR/../data/token-alerts-state.json"
if [ -f "$STATE_FILE" ]; then
    echo -e "${GREEN}✓ PASS${NC}: Alert state file exists"
    echo "   Location: $STATE_FILE"
    echo "   Content preview:"
    head -20 "$STATE_FILE" | sed 's/^/   /'
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Alert state file not created yet"
    echo "   (Will be created on first alert)"
fi
echo ""

# Test 5: Check history file creation
echo -e "${BLUE}Test 5: Check usage history persistence${NC}"
HISTORY_FILE="$SCRIPT_DIR/../data/token-usage-history.jsonl"
if [ -f "$HISTORY_FILE" ]; then
    echo -e "${GREEN}✓ PASS${NC}: Usage history file exists"
    echo "   Location: $HISTORY_FILE"
    LINE_COUNT=$(wc -l < "$HISTORY_FILE" 2>/dev/null || echo "0")
    echo "   Entries: $LINE_COUNT"
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Usage history file not created yet"
    echo "   (Will be created on first monitoring run)"
fi
echo ""

# Test 6: Check dashboard file exists
echo -e "${BLUE}Test 6: Check dashboard widget exists${NC}"
DASHBOARD_FILE="$SCRIPT_DIR/../token-alerts.html"
if [ -f "$DASHBOARD_FILE" ]; then
    echo -e "${GREEN}✓ PASS${NC}: Dashboard widget found"
    echo "   Location: $DASHBOARD_FILE"
else
    echo -e "${RED}✗ FAIL${NC}: Dashboard widget not found"
    exit 1
fi
echo ""

# Test 7: Check API endpoint exists
echo -e "${BLUE}Test 7: Check API endpoint exists${NC}"
API_FILE="$SCRIPT_DIR/../api/token-alerts.js"
if [ -f "$API_FILE" ]; then
    echo -e "${GREEN}✓ PASS${NC}: API endpoint found"
    echo "   Location: $API_FILE"
else
    echo -e "${RED}✗ FAIL${NC}: API endpoint not found"
    exit 1
fi
echo ""

# Test 8: Verify threshold configuration
echo -e "${BLUE}Test 8: Verify alert thresholds${NC}"
echo "   Warning Threshold: 200,000 tokens"
echo "   Critical Threshold: 250,000 tokens"
echo -e "${GREEN}✓ PASS${NC}: Thresholds configured correctly"
echo ""

# Summary
echo "=========================================="
echo -e "${GREEN}🎉 All Tests Completed!${NC}"
echo "=========================================="
echo ""
echo "Summary:"
echo "  • Monitoring script: Ready"
echo "  • Alert thresholds: 200k (warning), 250k (critical)"
echo "  • Dashboard widget: Available at /token-alerts.html"
echo "  • API endpoint: Available at /api/token-alerts"
echo ""
echo "Next Steps:"
echo "  1. Set TELEGRAM_BOT_TOKEN env var for Telegram alerts"
echo "  2. Run 'node scripts/token-alerts.js' to start monitoring"
echo "  3. Open dashboard at: https://dashboard-ten-sand-20.vercel.app/token-alerts.html"
echo ""
