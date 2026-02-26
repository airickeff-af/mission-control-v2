-- Mission Control v2.0 Database Migration
-- PostgreSQL Schema Migration
-- Created: 2026-02-26
-- Task: MC-P0-011

-- ============================================================================
-- MIGRATION METADATA
-- ============================================================================
CREATE TABLE IF NOT EXISTS migration_log (
    id SERIAL PRIMARY KEY,
    version VARCHAR(20) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    applied_by VARCHAR(255) DEFAULT CURRENT_USER,
    description TEXT,
    rollback_script TEXT,
    status VARCHAR(20) DEFAULT 'success'
);

-- Log this migration
INSERT INTO migration_log (version, description, rollback_script)
VALUES ('2.0.0', 'Mission Control v2.0 - Full schema migration', 'See rollback section at end of file');

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- AGENTS TABLE
-- Replaces: agents.json
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' 
        CHECK (status IN ('active', 'completed', 'pending', 'archived')),
    project VARCHAR(100) NOT NULL,
    task TEXT,
    priority VARCHAR(10) NOT NULL DEFAULT 'P1' 
        CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
    tokens INTEGER DEFAULT 0,
    sessions INTEGER DEFAULT 0,
    type VARCHAR(50) NOT NULL DEFAULT 'subagent' 
        CHECK (type IN ('main', 'subagent', 'cron')),
    session_key VARCHAR(255) UNIQUE,
    replaced_agent VARCHAR(100),
    consolidated_from TEXT[], -- Array of agent names consolidated into this one
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_project ON agents(project);
CREATE INDEX IF NOT EXISTS idx_agents_priority ON agents(priority);
CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(type);

-- ----------------------------------------------------------------------------
-- CONSOLIDATED AGENTS HISTORY
-- Tracks agent consolidations for audit trail
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_consolidations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_name VARCHAR(100) NOT NULL,
    consolidated_into VARCHAR(100) NOT NULL,
    consolidated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    FOREIGN KEY (consolidated_into) REFERENCES agents(name) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_consolidations_agent ON agent_consolidations(agent_name);
CREATE INDEX IF NOT EXISTS idx_consolidations_date ON agent_consolidations(consolidated_at);

-- ----------------------------------------------------------------------------
-- PROJECTS TABLE
-- Replaces: projects.json
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' 
        CHECK (status IN ('active', 'deployed', 'completed', 'archived', 'pending')),
    completion INTEGER DEFAULT 0 CHECK (completion >= 0 AND completion <= 100),
    url VARCHAR(500),
    pending_tasks INTEGER DEFAULT 0,
    lead VARCHAR(100),
    target_completion DATE,
    target_percent INTEGER DEFAULT 100 CHECK (target_percent >= 0 AND target_percent <= 100),
    priority INTEGER DEFAULT 99,
    deploy_by DATE,
    description TEXT,
    output_location TEXT,
    daily_target TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead) REFERENCES agents(name) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_lead ON projects(lead);

-- ----------------------------------------------------------------------------
-- PROJECT STATS TABLE
-- Flexible stats storage for projects
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(50) NOT NULL,
    stat_key VARCHAR(100) NOT NULL,
    stat_value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE(project_id, stat_key)
);

CREATE INDEX IF NOT EXISTS idx_project_stats_project ON project_stats(project_id);

-- ----------------------------------------------------------------------------
-- PROJECT FEATURES TABLE
-- For project feature lists
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(50) NOT NULL,
    feature TEXT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_project_features_project ON project_features(project_id);

-- ----------------------------------------------------------------------------
-- TASKS TABLE
-- Replaces: tasks.json
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(50) PRIMARY KEY,
    title TEXT NOT NULL,
    agent VARCHAR(100),
    priority VARCHAR(10) NOT NULL DEFAULT 'P1' 
        CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
    due TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'in-progress', 'completed', 'blocked', 'cancelled')),
    project VARCHAR(50) NOT NULL,
    description TEXT,
    git_commit VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (agent) REFERENCES agents(name) ON DELETE SET NULL,
    FOREIGN KEY (project) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_agent ON tasks(agent);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due);

-- ----------------------------------------------------------------------------
-- ACTIVITY LOG TABLE
-- Replaces: activity-log.json
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    agent VARCHAR(100) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    project VARCHAR(50),
    type VARCHAR(50) DEFAULT 'system' 
        CHECK (type IN ('system', 'deploy', 'complete', 'update', 'error', 'warning')),
    FOREIGN KEY (agent) REFERENCES agents(name) ON DELETE CASCADE,
    FOREIGN KEY (project) REFERENCES projects(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_agent ON activity_log(agent);
CREATE INDEX IF NOT EXISTS idx_activity_project ON activity_log(project);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_log(type);

-- ----------------------------------------------------------------------------
-- TOKEN USAGE TABLE
-- Replaces: tokens.json
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS token_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent VARCHAR(100) NOT NULL,
    tokens INTEGER NOT NULL DEFAULT 0,
    cost DECIMAL(10, 4) DEFAULT 0,
    sessions INTEGER DEFAULT 0,
    avg_per_session INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent) REFERENCES agents(name) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_token_usage_agent ON token_usage(agent);
CREATE INDEX IF NOT EXISTS idx_token_usage_date ON token_usage(recorded_at);

-- ----------------------------------------------------------------------------
-- TOKEN DAILY HISTORY TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS token_daily_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    tokens INTEGER NOT NULL DEFAULT 0,
    cost DECIMAL(10, 4) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_token_history_date ON token_daily_history(date);

-- ----------------------------------------------------------------------------
-- SESSIONS TABLE
-- Replaces: sessions.json
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_key VARCHAR(255) UNIQUE NOT NULL,
    agent VARCHAR(100) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    tokens_used INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' 
        CHECK (status IN ('active', 'completed', 'error')),
    FOREIGN KEY (agent) REFERENCES agents(name) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_agent ON sessions(agent);
CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

-- ----------------------------------------------------------------------------
-- KANBAN BOARD TABLE
-- Replaces: kanban.json
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kanban_boards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    project_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- KANBAN COLUMNS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kanban_columns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES kanban_boards(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- KANBAN CARDS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kanban_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    column_id UUID NOT NULL,
    task_id VARCHAR(50),
    title TEXT NOT NULL,
    description TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    assignee VARCHAR(100),
    priority VARCHAR(10) DEFAULT 'P1',
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (column_id) REFERENCES kanban_columns(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (assignee) REFERENCES agents(name) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_kanban_cards_column ON kanban_cards(column_id);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_task ON kanban_cards(task_id);

-- ----------------------------------------------------------------------------
-- RESEARCH INDEX TABLE
-- Replaces: research-index.json
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS research_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    source_url TEXT,
    summary TEXT,
    file_path TEXT,
    word_count INTEGER,
    status VARCHAR(50) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'in-progress', 'completed', 'archived')),
    assigned_agent VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (assigned_agent) REFERENCES agents(name) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_research_topic ON research_items USING gin(topic gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_research_category ON research_items(category);
CREATE INDEX IF NOT EXISTS idx_research_status ON research_items(status);

-- ----------------------------------------------------------------------------
-- RESEARCH TAGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS research_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    research_id UUID NOT NULL,
    tag VARCHAR(100) NOT NULL,
    FOREIGN KEY (research_id) REFERENCES research_items(id) ON DELETE CASCADE,
    UNIQUE(research_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_research_tags_tag ON research_tags(tag);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active agents with their current tasks
CREATE OR REPLACE VIEW v_active_agents AS
SELECT 
    a.*,
    COUNT(t.id) FILTER (WHERE t.status IN ('pending', 'in-progress')) as pending_tasks
FROM agents a
LEFT JOIN tasks t ON a.name = t.agent
WHERE a.status = 'active'
GROUP BY a.id;

-- Project summary with stats
CREATE OR REPLACE VIEW v_project_summary AS
SELECT 
    p.*,
    COUNT(t.id) FILTER (WHERE t.status IN ('pending', 'in-progress')) as actual_pending_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'completed') as completed_tasks
FROM projects p
LEFT JOIN tasks t ON p.id = t.project
GROUP BY p.id;

-- Token usage summary
CREATE OR REPLACE VIEW v_token_summary AS
SELECT 
    COALESCE(SUM(tokens), 0) as total_tokens,
    COALESCE(SUM(cost), 0) as total_cost,
    COUNT(DISTINCT agent) as active_agents,
    (SELECT COALESCE(SUM(tokens), 0) FROM token_daily_history 
     WHERE date >= CURRENT_DATE - INTERVAL '30 days') as tokens_30d
FROM token_usage
WHERE recorded_at >= CURRENT_DATE;

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kanban_boards_updated_at BEFORE UPDATE ON kanban_boards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kanban_cards_updated_at BEFORE UPDATE ON kanban_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update task completed_at
CREATE OR REPLACE FUNCTION update_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_task_completed_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_task_completed_at();

-- ============================================================================
-- DATA MIGRATION FROM JSON FILES
-- ============================================================================

-- Note: This section would be run after the schema is created
-- to migrate existing JSON data into the new tables

-- Migration function for agents
CREATE OR REPLACE FUNCTION migrate_agents_from_json(agents_json JSONB)
RETURNS INTEGER AS $$
DECLARE
    agent_record JSONB;
    inserted_count INTEGER := 0;
BEGIN
    FOR agent_record IN SELECT * FROM jsonb_array_elements(agents_json)
    LOOP
        INSERT INTO agents (
            name, role, status, project, task, priority, 
            tokens, sessions, type, session_key, replaced_agent
        ) VALUES (
            agent_record->>'name',
            agent_record->>'role',
            COALESCE(agent_record->>'status', 'active'),
            agent_record->>'project',
            agent_record->>'task',
            COALESCE(agent_record->>'priority', 'P1'),
            COALESCE((agent_record->>'tokens')::INTEGER, 0),
            COALESCE((agent_record->>'sessions')::INTEGER, 0),
            COALESCE(agent_record->>'type', 'subagent'),
            agent_record->>'sessionKey',
            agent_record->>'replaced'
        )
        ON CONFLICT (name) DO UPDATE SET
            role = EXCLUDED.role,
            status = EXCLUDED.status,
            project = EXCLUDED.project,
            task = EXCLUDED.task,
            priority = EXCLUDED.priority,
            tokens = EXCLUDED.tokens,
            sessions = EXCLUDED.sessions,
            type = EXCLUDED.type,
            session_key = EXCLUDED.session_key,
            replaced_agent = EXCLUDED.replaced_agent,
            updated_at = CURRENT_TIMESTAMP;
        
        inserted_count := inserted_count + 1;
    END LOOP;
    
    RETURN inserted_count;
END;
$$ language 'plpgsql';

-- ============================================================================
-- BACKWARD COMPATIBILITY
-- ============================================================================

-- Create a compatibility view that mimics the old JSON structure
CREATE OR REPLACE VIEW v_agents_json_compat AS
SELECT jsonb_build_object(
    'lastUpdated', CURRENT_TIMESTAMP,
    'agents', COALESCE(
        (SELECT jsonb_agg(
            jsonb_build_object(
                'name', name,
                'role', role,
                'status', status,
                'project', project,
                'task', task,
                'priority', priority,
                'tokens', tokens,
                'sessions', sessions,
                'type', type,
                'sessionKey', session_key,
                'replaced', replaced_agent
            )
        ) FROM agents WHERE status != 'archived'),
        '[]'::jsonb
    )
) as data;

-- ============================================================================
-- ROLLBACK SCRIPT (for migration_log reference)
-- ============================================================================
/*
ROLLBACK SCRIPT - Run this to revert v2.0 migration:

-- Drop views
DROP VIEW IF EXISTS v_agents_json_compat;
DROP VIEW IF EXISTS v_token_summary;
DROP VIEW IF EXISTS v_project_summary;
DROP VIEW IF EXISTS v_active_agents;

-- Drop tables (in dependency order)
DROP TABLE IF EXISTS research_tags;
DROP TABLE IF EXISTS research_items;
DROP TABLE IF EXISTS kanban_cards;
DROP TABLE IF EXISTS kanban_columns;
DROP TABLE IF EXISTS kanban_boards;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS token_daily_history;
DROP TABLE IF EXISTS token_usage;
DROP TABLE IF EXISTS activity_log;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS project_features;
DROP TABLE IF EXISTS project_stats;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS agent_consolidations;
DROP TABLE IF EXISTS agents;
DROP TABLE IF EXISTS migration_log;

-- Drop functions
DROP FUNCTION IF EXISTS update_task_completed_at();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS migrate_agents_from_json(JSONB);

Note: Original mc-project tables (health_logs, wealth_logs, character_stats, 
character_models) are preserved and untouched.
*/

-- ============================================================================
-- MIGRATION COMPLETION
-- ============================================================================

UPDATE migration_log 
SET status = 'success', 
    description = 'Mission Control v2.0 schema migration completed successfully'
WHERE version = '2.0.0';

-- Verify migration
SELECT 'Migration v2.0.0 completed successfully' as status,
       COUNT(*) as tables_created
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'agents', 'projects', 'tasks', 'activity_log', 
    'token_usage', 'sessions', 'kanban_boards', 
    'research_items', 'migration_log'
  );