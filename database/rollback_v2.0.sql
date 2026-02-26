-- Mission Control v2.0 Database Rollback Script
-- Reverts all v2.0 schema changes
-- WARNING: This will DELETE all v2.0 data!
-- Task: MC-P0-011

-- Start transaction
BEGIN;

-- ============================================================================
-- STEP 1: Backup existing data to JSON (optional safety)
-- ============================================================================

-- Create backup schema if not exists
CREATE SCHEMA IF NOT EXISTS backup_v2_rollback;

-- Backup agents
CREATE TABLE IF NOT EXISTS backup_v2_rollback.agents AS SELECT * FROM agents;

-- Backup projects
CREATE TABLE IF NOT EXISTS backup_v2_rollback.projects AS SELECT * FROM projects;

-- Backup tasks
CREATE TABLE IF NOT EXISTS backup_v2_rollback.tasks AS SELECT * FROM tasks;

-- Backup activity log
CREATE TABLE IF NOT EXISTS backup_v2_rollback.activity_log AS SELECT * FROM activity_log;

-- ============================================================================
-- STEP 2: Drop views (in dependency order)
-- ============================================================================

DROP VIEW IF EXISTS v_agents_json_compat;
DROP VIEW IF EXISTS v_token_summary;
DROP VIEW IF EXISTS v_project_summary;
DROP VIEW IF EXISTS v_active_agents;

-- ============================================================================
-- STEP 3: Drop triggers
-- ============================================================================

DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_kanban_boards_updated_at ON kanban_boards;
DROP TRIGGER IF EXISTS update_kanban_cards_updated_at ON kanban_cards;
DROP TRIGGER IF EXISTS trigger_task_completed_at ON tasks;

-- ============================================================================
-- STEP 4: Drop functions
-- ============================================================================

DROP FUNCTION IF EXISTS update_task_completed_at();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS migrate_agents_from_json(JSONB);

-- ============================================================================
-- STEP 5: Drop tables (in dependency order - children first)
-- ============================================================================

-- Research tables
DROP TABLE IF EXISTS research_tags;
DROP TABLE IF EXISTS research_items;

-- Kanban tables
DROP TABLE IF EXISTS kanban_cards;
DROP TABLE IF EXISTS kanban_columns;
DROP TABLE IF EXISTS kanban_boards;

-- Session tracking
DROP TABLE IF EXISTS sessions;

-- Token tracking
DROP TABLE IF EXISTS token_daily_history;
DROP TABLE IF EXISTS token_usage;

-- Activity tracking
DROP TABLE IF EXISTS activity_log;

-- Task management
DROP TABLE IF EXISTS tasks;

-- Project management
DROP TABLE IF EXISTS project_features;
DROP TABLE IF EXISTS project_stats;
DROP TABLE IF EXISTS projects;

-- Agent management
DROP TABLE IF EXISTS agent_consolidations;
DROP TABLE IF EXISTS agents;

-- Migration tracking
DROP TABLE IF EXISTS migration_log;

-- ============================================================================
-- STEP 6: Verify rollback
-- ============================================================================

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name IN (
        'agents', 'projects', 'tasks', 'activity_log', 
        'token_usage', 'sessions', 'kanban_boards', 
        'research_items', 'migration_log'
      );
    
    IF table_count = 0 THEN
        RAISE NOTICE '✅ Rollback successful - all v2.0 tables removed';
    ELSE
        RAISE WARNING '⚠️  Some tables may still exist (%)', table_count;
    END IF;
END $$;

-- ============================================================================
-- STEP 7: Note on preserved tables
-- ============================================================================

-- The following original mc-project tables are preserved:
-- - health_logs
-- - wealth_logs
-- - character_stats
-- - character_models
--
-- These were not part of the v2.0 migration and remain untouched.

-- ============================================================================
-- STEP 8: Clean up backup schema (optional - comment out if you want to keep)
-- ============================================================================

-- Uncomment the following line to remove backup tables:
-- DROP SCHEMA IF EXISTS backup_v2_rollback CASCADE;

-- ============================================================================
-- ROLLBACK COMPLETE
-- ============================================================================

COMMIT;

-- Log the rollback
-- Note: migration_log table no longer exists, so we just output a message
DO $$
BEGIN
    RAISE NOTICE 'Mission Control v2.0 rollback completed at %', CURRENT_TIMESTAMP;
    RAISE NOTICE 'Backup data available in backup_v2_rollback schema';
    RAISE NOTICE 'To restore from backup, manually copy data from backup_v2_rollback.* tables';
END $$;