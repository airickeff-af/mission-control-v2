# Mission Control v2.0 Database Migration

**Task:** MC-P0-011  
**Created:** 2026-02-26  
**Due:** 2026-02-26 14:00 HKT  
**Status:** ✅ COMPLETED

---

## Overview

This migration transforms Mission Control from a JSON-file-based data store to a proper PostgreSQL relational database, enabling better data integrity, querying capabilities, and scalability for v2.0 features.

---

## Migration Files

| File | Purpose | Size |
|------|---------|------|
| `migration_v2.0.sql` | Main schema migration | ~21KB |
| `migrate-data.js` | Data migration from JSON | ~23KB |
| `rollback_v2.0.sql` | Rollback script | ~5KB |
| `MIGRATION_GUIDE.md` | This documentation | - |

---

## Schema Changes

### New Tables Created

#### Core Tables
1. **`agents`** - Agent management (replaces `agents.json`)
2. **`projects`** - Project tracking (replaces `projects.json`)
3. **`tasks`** - Task management (replaces `tasks.json`)
4. **`activity_log`** - Activity tracking (replaces `activity-log.json`)
5. **`sessions`** - Session tracking (replaces `sessions.json`)

#### Supporting Tables
6. **`agent_consolidations`** - Tracks agent consolidation history
7. **`project_stats`** - Flexible project statistics storage (JSONB)
8. **`project_features`** - Project feature lists
9. **`token_usage`** - Token usage tracking (replaces `tokens.json`)
10. **`token_daily_history`** - Daily token usage history
11. **`kanban_boards`** - Kanban board definitions
12. **`kanban_columns`** - Kanban column definitions
13. **`kanban_cards`** - Kanban cards/tasks
14. **`research_items`** - Research index (replaces `research-index.json`)
15. **`research_tags`** - Research item tags
16. **`migration_log`** - Migration history tracking

### Views Created
- **`v_active_agents`** - Active agents with pending task counts
- **`v_project_summary`** - Projects with computed statistics
- **`v_token_summary`** - Token usage summary
- **`v_agents_json_compat`** - Backward-compatible JSON view

### Functions & Triggers
- **`update_updated_at_column()`** - Auto-updates `updated_at` timestamps
- **`update_task_completed_at()`** - Auto-sets `completed_at` when task completes
- **`migrate_agents_from_json(JSONB)`** - Helper for JSON migration

---

## Backward Compatibility

### Preserved Tables (from mc-project)
The following tables from the original mc-project remain **untouched**:
- `health_logs`
- `wealth_logs`
- `character_stats`
- `character_models`

### Compatibility View
The `v_agents_json_compat` view provides a JSON structure matching the old `agents.json` format for legacy integrations.

---

## Migration Steps

### 1. Pre-Migration Checklist

```bash
# Backup existing data
cp -r /root/.openclaw/workspace/mission-control-v2/data /root/.openclaw/workspace/mission-control-v2/data-backup-$(date +%Y%m%d)

# Verify PostgreSQL connection
psql -h localhost -U postgres -d mission_control -c "SELECT version();"
```

### 2. Run Schema Migration

```bash
# Apply schema
psql -h localhost -U postgres -d mission_control -f migration_v2.0.sql
```

### 3. Migrate Data

```bash
# Install dependencies if needed
cd /root/.openclaw/workspace/mission-control-v2/database
npm install pg

# Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=mission_control
export DB_USER=postgres
export DB_PASSWORD=your_password

# Run migration
node migrate-data.js
```

### 4. Verify Migration

```sql
-- Check record counts
SELECT 'agents' as table_name, COUNT(*) as count FROM agents
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'activity_log', COUNT(*) FROM activity_log;
```

---

## Rollback Procedure

**⚠️ WARNING: Rollback will DELETE all v2.0 data!**

### Automatic Rollback

```bash
# Run rollback script
psql -h localhost -U postgres -d mission_control -f rollback_v2.0.sql
```

### What Rollback Does
1. Creates backup tables in `backup_v2_rollback` schema
2. Drops all v2.0 views
3. Drops all v2.0 triggers
4. Drops all v2.0 functions
5. Drops all v2.0 tables (in dependency order)
6. Preserves original mc-project tables

### Restore from Backup

If you need to restore data after rollback:

```sql
-- Restore agents
INSERT INTO agents SELECT * FROM backup_v2_rollback.agents;

-- Restore projects
INSERT INTO projects SELECT * FROM backup_v2_rollback.projects;

-- Restore tasks
INSERT INTO tasks SELECT * FROM backup_v2_rollback.tasks;

-- Clean up backup schema when done
DROP SCHEMA backup_v2_rollback CASCADE;
```

---

## Data Integrity

### Constraints Enforced

| Table | Constraints |
|-------|-------------|
| `agents` | Unique name, valid status/priority enums |
| `projects` | Valid status enum, completion 0-100 |
| `tasks` | Valid status/priority enums, FK to agents/projects |
| `sessions` | Unique session_key, FK to agents |
| `token_usage` | FK to agents |

### Indexes Created

All foreign keys and commonly queried columns are indexed:
- `agents.status`, `agents.project`, `agents.priority`
- `projects.status`, `projects.priority`, `projects.lead`
- `tasks.status`, `tasks.priority`, `tasks.agent`, `tasks.project`, `tasks.due`
- `activity_log.timestamp`, `activity_log.agent`, `activity_log.project`

---

## Testing

### Test Migration on Backup Data

```bash
# Create test database
createdb -U postgres mission_control_test

# Apply migration to test DB
psql -U postgres -d mission_control_test -f migration_v2.0.sql

# Copy test data
cp -r data data-test

# Run migration on test data
DB_NAME=mission_control_test node migrate-data.js

# Verify
psql -U postgres -d mission_control_test -c "SELECT * FROM v_project_summary;"
```

### Acceptance Criteria Verification

| Criteria | Status | Verification |
|----------|--------|--------------|
| Migration script runs without errors | ✅ | Tested on local PostgreSQL |
| All existing data preserved | ✅ | JSON data migrated to tables |
| New schema supports v2.0 features | ✅ | Tables for all v2.0 features created |
| Rollback plan documented | ✅ | rollback_v2.0.sql provided |

---

## Performance Considerations

### Query Optimization
- All foreign keys indexed
- GIN indexes on text search fields (research topics)
- Partial indexes for active records

### Data Growth
- `activity_log` may grow large - consider partitioning by month
- `token_daily_history` - archive data older than 1 year
- `sessions` - purge completed sessions older than 90 days

---

## Troubleshooting

### Common Issues

#### Connection Refused
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Start if needed
sudo systemctl start postgresql
```

#### Permission Denied
```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE mission_control TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
```

#### Duplicate Key Errors
```sql
-- Check for duplicates before migration
SELECT name, COUNT(*) FROM agents GROUP BY name HAVING COUNT(*) > 1;
```

---

## Post-Migration Tasks

1. **Update Application Code**
   - Replace JSON file reads with SQL queries
   - Update write operations to use INSERT/UPDATE

2. **Set Up Backups**
   ```bash
   # Add to cron for daily backups
   pg_dump -U postgres mission_control > backup-$(date +%Y%m%d).sql
   ```

3. **Monitor Performance**
   - Enable query logging
   - Set up slow query alerts

4. **Archive Old JSON Files**
   ```bash
   mv data data-archive-$(date +%Y%m%d)
   mkdir data  # Create empty directory for compatibility
   ```

---

## Contact

For issues with this migration:
- **Task:** MC-P0-011
- **Agent:** Cipher
- **Project:** Mission Control v2.0

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-26 | 2.0.0 | Initial migration created |