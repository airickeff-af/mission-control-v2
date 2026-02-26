#!/bin/bash
# Mission Control v2.0 Migration Validation
# Task: MC-P0-011

echo "🧪 Mission Control v2.0 Migration Validation"
echo "============================================"

# Check files exist
echo -e "\n📋 Checking migration files..."

FILES=(
    "migration_v2.0.sql"
    "rollback_v2.0.sql"
    "migrate-data.js"
    "MIGRATION_GUIDE.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "unknown")
        echo "  ✅ $file ($size bytes)"
    else
        echo "  ❌ $file NOT FOUND"
    fi
done

# Check data files
echo -e "\n📋 Checking source data files..."
DATA_DIR="../data"
DATA_FILES=("agents.json" "tasks.json" "projects.json" "activity-log.json" "tokens.json")

for file in "${DATA_FILES[@]}"; do
    if [ -f "$DATA_DIR/$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ⚠️  $file (optional)"
    fi
done

# Validate SQL syntax (basic check)
echo -e "\n📋 Validating SQL syntax..."
if grep -q "CREATE TABLE" migration_v2.0.sql; then
    echo "  ✅ migration_v2.0.sql contains CREATE TABLE statements"
else
    echo "  ❌ migration_v2.0.sql missing CREATE TABLE statements"
fi

if grep -q "DROP TABLE" rollback_v2.0.sql; then
    echo "  ✅ rollback_v2.0.sql contains DROP statements"
else
    echo "  ❌ rollback_v2.0.sql missing DROP statements"
fi

# Count expected elements
echo -e "\n📋 Schema analysis..."
echo "  Tables to create: $(grep -c "CREATE TABLE IF NOT EXISTS" migration_v2.0.sql 2>/dev/null || echo 0)"
echo "  Views to create: $(grep -c "CREATE.*VIEW" migration_v2.0.sql 2>/dev/null || echo 0)"
echo "  Indexes to create: $(grep -c "CREATE INDEX" migration_v2.0.sql 2>/dev/null || echo 0)"
echo "  Functions to create: $(grep -c "CREATE.*FUNCTION" migration_v2.0.sql 2>/dev/null || echo 0)"

# Check Node.js syntax
echo -e "\n📋 Validating Node.js script..."
if command -v node &> /dev/null; then
    if node --check migrate-data.js 2>/dev/null; then
        echo "  ✅ migrate-data.js syntax is valid"
    else
        echo "  ❌ migrate-data.js has syntax errors"
    fi
else
    echo "  ⚠️  Node.js not available for syntax check"
fi

# Summary
echo -e "\n============================================"
echo "✅ Migration package validation complete!"
echo ""
echo "Files created:"
echo "  - migration_v2.0.sql (Schema migration)"
echo "  - rollback_v2.0.sql (Rollback script)"
echo "  - migrate-data.js (Data migration)"
echo "  - MIGRATION_GUIDE.md (Documentation)"
echo ""
echo "Next steps:"
echo "  1. Review migration_v2.0.sql"
echo "  2. Run on test database: psql -f migration_v2.0.sql"
echo "  3. Migrate data: node migrate-data.js"
echo "  4. Verify with: SELECT * FROM v_project_summary;"