#!/bin/bash
# Mission Control v2.0 Migration Test Script
# Task: MC-P0-011

set -e  # Exit on error

echo "🧪 Mission Control v2.0 Migration Test Suite"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
TEST_DB="mission_control_test_$(date +%s)"
SCHEMA_FILE="migration_v2.0.sql"
ROLLBACK_FILE="rollback_v2.0.sql"

# Counters
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((TESTS_PASSED++))
}

fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((TESTS_FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
}

# Test 1: Schema file exists
echo -e "\n📋 Test 1: Schema file exists"
if [ -f "$SCHEMA_FILE" ]; then
    pass "Schema file exists ($SCHEMA_FILE)"
else
    fail "Schema file not found: $SCHEMA_FILE"
fi

# Test 2: Rollback file exists
echo -e "\n📋 Test 2: Rollback file exists"
if [ -f "$ROLLBACK_FILE" ]; then
    pass "Rollback file exists ($ROLLBACK_FILE)"
else
    fail "Rollback file not found: $ROLLBACK_FILE"
fi

# Test 3: SQL syntax validation
echo -e "\n📋 Test 3: SQL syntax validation"
if command -v psql &> /dev/null; then
    # Create test database
    if createdb "$TEST_DB" 2>/dev/null; then
        # Try to apply schema
        if psql -d "$TEST_DB" -f "$SCHEMA_FILE" > /dev/null 2>&1; then
            pass "Schema applies without SQL errors"
            
            # Test 4: Verify tables created
            echo -e "\n📋 Test 4: Verify tables created"
            EXPECTED_TABLES=("agents" "projects" "tasks" "activity_log" "token_usage" "sessions" "kanban_boards" "research_items" "migration_log")
            ALL_TABLES_EXIST=true
            
            for table in "${EXPECTED_TABLES[@]}"; do
                if psql -d "$TEST_DB" -tc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$table');" | grep -q "t"; then
                    echo "  ✅ Table exists: $table"
                else
                    echo "  ❌ Table missing: $table"
                    ALL_TABLES_EXIST=false
                fi
            done
            
            if [ "$ALL_TABLES_EXIST" = true ]; then
                pass "All expected tables created"
            else
                fail "Some tables are missing"
            fi
            
            # Test 5: Verify views created
            echo -e "\n📋 Test 5: Verify views created"
            EXPECTED_VIEWS=("v_active_agents" "v_project_summary" "v_token_summary" "v_agents_json_compat")
            ALL_VIEWS_EXIST=true
            
            for view in "${EXPECTED_VIEWS[@]}"; do
                if psql -d "$TEST_DB" -tc "SELECT EXISTS (SELECT FROM information_schema.views WHERE table_name = '$view');" | grep -q "t"; then
                    echo "  ✅ View exists: $view"
                else
                    echo "  ❌ View missing: $view"
                    ALL_VIEWS_EXIST=false
                fi
            done
            
            if [ "$ALL_VIEWS_EXIST" = true ]; then
                pass "All expected views created"
            else
                fail "Some views are missing"
            fi
            
            # Test 6: Verify indexes created
            echo -e "\n📋 Test 6: Verify indexes created"
            INDEX_COUNT=$(psql -d "$TEST_DB" -tc "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';" | xargs)
            if [ "$INDEX_COUNT" -gt 10 ]; then
                pass "Indexes created ($INDEX_COUNT found)"
            else
                fail "Insufficient indexes ($INDEX_COUNT found, expected >10)"
            fi
            
            # Test 7: Verify constraints
            echo -e "\n📋 Test 7: Verify constraints"
            CONSTRAINT_COUNT=$(psql -d "$TEST_DB" -tc "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_schema = 'public';" | xargs)
            if [ "$CONSTRAINT_COUNT" -gt 5 ]; then
                pass "Constraints created ($CONSTRAINT_COUNT found)"
            else
                fail "Insufficient constraints ($CONSTRAINT_COUNT found, expected >5)"
            fi
            
            # Test 8: Test rollback
            echo -e "\n📋 Test 8: Test rollback procedure"
            if psql -d "$TEST_DB" -f "$ROLLBACK_FILE" > /dev/null 2>&1; then
                # Verify tables are gone
                REMAINING_TABLES=$(psql -d "$TEST_DB" -tc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('agents', 'projects', 'tasks', 'activity_log', 'token_usage', 'sessions', 'kanban_boards', 'research_items', 'migration_log');" | xargs)
                if [ "$REMAINING_TABLES" -eq 0 ]; then
                    pass "Rollback removes all v2.0 tables"
                else
                    fail "Rollback incomplete ($REMAINING_TABLES tables remain)"
                fi
            else
                fail "Rollback script failed"
            fi
            
            # Cleanup
            dropdb "$TEST_DB" 2>/dev/null || true
            
        else
            fail "Schema has SQL errors"
            dropdb "$TEST_DB" 2>/dev/null || true
        fi
    else
        warn "Could not create test database - skipping SQL tests"
    fi
else
    warn "PostgreSQL not available - skipping SQL tests"
fi

# Test 9: Data migration script exists
echo -e "\n📋 Test 9: Data migration script"
if [ -f "migrate-data.js" ]; then
    pass "Data migration script exists"
    
    # Check if Node.js is available
    if command -v node &> /dev/null; then
        # Test 10: Validate Node.js syntax
        echo -e "\n📋 Test 10: Node.js syntax validation"
        if node --check migrate-data.js 2>/dev/null; then
            pass "Node.js script has valid syntax"
        else
            fail "Node.js script has syntax errors"
        fi
    else
        warn "Node.js not available - skipping syntax check"
    fi
else
    fail "Data migration script not found"
fi

# Test 11: Documentation exists
echo -e "\n📋 Test 11: Documentation"
if [ -f "MIGRATION_GUIDE.md" ]; then
    pass "Migration guide exists"
else
    fail "Migration guide not found"
fi

# Test 12: JSON data files exist for migration
echo -e "\n📋 Test 12: Source data files"
DATA_DIR="../data"
EXPECTED_FILES=("agents.json" "tasks.json" "projects.json" "activity-log.json" "tokens.json")
ALL_FILES_EXIST=true

for file in "${EXPECTED_FILES[@]}"; do
    if [ -f "$DATA_DIR/$file" ]; then
        echo "  ✅ Found: $file"
    else
        echo "  ⚠️  Missing: $file"
        ALL_FILES_EXIST=false
    fi
done

if [ "$ALL_FILES_EXIST" = true ]; then
    pass "All expected data files present"
else
    warn "Some data files are missing (migration may have limited data)"
fi

# Summary
echo -e "\n============================================"
echo "📊 Test Summary"
echo "============================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ "$TESTS_FAILED" -eq 0 ]; then
    echo -e "\n${GREEN}✅ All tests passed! Migration is ready.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please review.${NC}"
    exit 1
fi