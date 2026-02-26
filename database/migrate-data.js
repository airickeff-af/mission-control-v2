#!/usr/bin/env node
/**
 * Mission Control v2.0 - Data Migration Script
 * Migrates existing JSON data to PostgreSQL database
 * Task: MC-P0-011
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Configuration
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'mission_control',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
};

// Migration state tracking
const MIGRATION_STATE_FILE = path.join(__dirname, 'migration-state.json');

class DataMigrator {
    constructor() {
        this.client = new Client(DB_CONFIG);
        this.stats = {
            agents: { inserted: 0, updated: 0, errors: 0 },
            projects: { inserted: 0, updated: 0, errors: 0 },
            tasks: { inserted: 0, updated: 0, errors: 0 },
            activityLog: { inserted: 0, errors: 0 },
            tokens: { inserted: 0, errors: 0 },
            sessions: { inserted: 0, errors: 0 },
            kanban: { inserted: 0, errors: 0 },
            research: { inserted: 0, errors: 0 }
        };
    }

    async connect() {
        console.log('🔌 Connecting to database...');
        await this.client.connect();
        console.log('✅ Connected to database');
    }

    async disconnect() {
        await this.client.end();
        console.log('🔌 Disconnected from database');
    }

    loadJson(filename) {
        const filepath = path.join(DATA_DIR, filename);
        if (!fs.existsSync(filepath)) {
            console.warn(`⚠️  File not found: ${filepath}`);
            return null;
        }
        try {
            const data = fs.readFileSync(filepath, 'utf8');
            return JSON.parse(data);
        } catch (err) {
            console.error(`❌ Error parsing ${filename}:`, err.message);
            return null;
        }
    }

    async migrateAgents() {
        console.log('\n📦 Migrating agents...');
        const data = this.loadJson('agents.json');
        if (!data || !data.agents) {
            console.log('⚠️  No agents data found');
            return;
        }

        for (const agent of data.agents) {
            try {
                const query = `
                    INSERT INTO agents (
                        name, role, status, project, task, priority,
                        tokens, sessions, type, session_key, replaced_agent, consolidated_from
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
                        consolidated_from = EXCLUDED.consolidated_from,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING (xmax = 0) as inserted
                `;
                
                const values = [
                    agent.name,
                    agent.role,
                    agent.status || 'active',
                    agent.project,
                    agent.task,
                    agent.priority || 'P1',
                    agent.tokens || 0,
                    agent.sessions || 0,
                    agent.type || 'subagent',
                    agent.sessionKey,
                    agent.replaced || null,
                    agent.consolidated ? JSON.stringify(agent.consolidated) : null
                ];

                const result = await this.client.query(query, values);
                if (result.rows[0].inserted) {
                    this.stats.agents.inserted++;
                } else {
                    this.stats.agents.updated++;
                }
            } catch (err) {
                console.error(`❌ Error migrating agent ${agent.name}:`, err.message);
                this.stats.agents.errors++;
            }
        }

        // Migrate consolidated agents history
        if (data.consolidatedAgents) {
            for (const consolidation of data.consolidatedAgents) {
                try {
                    await this.client.query(`
                        INSERT INTO agent_consolidations (agent_name, consolidated_into, reason)
                        VALUES ($1, $2, $3)
                        ON CONFLICT DO NOTHING
                    `, [consolidation.name, consolidation.consolidatedInto, consolidation.reason]);
                } catch (err) {
                    console.error(`❌ Error migrating consolidation:`, err.message);
                }
            }
        }

        console.log(`✅ Agents: ${this.stats.agents.inserted} inserted, ${this.stats.agents.updated} updated, ${this.stats.agents.errors} errors`);
    }

    async migrateProjects() {
        console.log('\n📦 Migrating projects...');
        const data = this.loadJson('projects.json');
        if (!data || !data.projects) {
            console.log('⚠️  No projects data found');
            return;
        }

        for (const project of data.projects) {
            try {
                const query = `
                    INSERT INTO projects (
                        id, name, status, completion, url, pending_tasks, lead,
                        target_completion, target_percent, priority, deploy_by,
                        description, output_location, daily_target
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        status = EXCLUDED.status,
                        completion = EXCLUDED.completion,
                        url = EXCLUDED.url,
                        pending_tasks = EXCLUDED.pending_tasks,
                        lead = EXCLUDED.lead,
                        target_completion = EXCLUDED.target_completion,
                        target_percent = EXCLUDED.target_percent,
                        priority = EXCLUDED.priority,
                        deploy_by = EXCLUDED.deploy_by,
                        description = EXCLUDED.description,
                        output_location = EXCLUDED.output_location,
                        daily_target = EXCLUDED.daily_target,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING (xmax = 0) as inserted
                `;

                const values = [
                    project.id,
                    project.name,
                    project.status,
                    project.completion || 0,
                    project.url,
                    project.pendingTasks || 0,
                    project.lead,
                    project.targetCompletion ? new Date(project.targetCompletion) : null,
                    project.targetPercent || 100,
                    project.priority || 99,
                    project.deployBy ? new Date(project.deployBy) : null,
                    project.description || null,
                    project.outputLocation || null,
                    project.dailyTarget || null
                ];

                const result = await this.client.query(query, values);
                if (result.rows[0].inserted) {
                    this.stats.projects.inserted++;
                } else {
                    this.stats.projects.updated++;
                }

                // Migrate project stats
                if (project.stats) {
                    for (const [key, value] of Object.entries(project.stats)) {
                        await this.client.query(`
                            INSERT INTO project_stats (project_id, stat_key, stat_value)
                            VALUES ($1, $2, $3)
                            ON CONFLICT (project_id, stat_key) DO UPDATE SET
                                stat_value = EXCLUDED.stat_value,
                                updated_at = CURRENT_TIMESTAMP
                        `, [project.id, key, JSON.stringify(value)]);
                    }
                }

                // Migrate project features
                if (project.features && Array.isArray(project.features)) {
                    for (const feature of project.features) {
                        await this.client.query(`
                            INSERT INTO project_features (project_id, feature)
                            VALUES ($1, $2)
                            ON CONFLICT DO NOTHING
                        `, [project.id, feature]);
                    }
                }

            } catch (err) {
                console.error(`❌ Error migrating project ${project.id}:`, err.message);
                this.stats.projects.errors++;
            }
        }

        console.log(`✅ Projects: ${this.stats.projects.inserted} inserted, ${this.stats.projects.updated} updated, ${this.stats.projects.errors} errors`);
    }

    async migrateTasks() {
        console.log('\n📦 Migrating tasks...');
        const data = this.loadJson('tasks.json');
        if (!data || !data.pendingTasks) {
            console.log('⚠️  No tasks data found');
            return;
        }

        const allTasks = [
            ...(data.pendingTasks || []),
            ...(data.completedTasks || [])
        ];

        for (const task of allTasks) {
            try {
                const query = `
                    INSERT INTO tasks (
                        id, title, agent, priority, due, status, project,
                        description, git_commit, completed_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    ON CONFLICT (id) DO UPDATE SET
                        title = EXCLUDED.title,
                        agent = EXCLUDED.agent,
                        priority = EXCLUDED.priority,
                        due = EXCLUDED.due,
                        status = EXCLUDED.status,
                        project = EXCLUDED.project,
                        description = EXCLUDED.description,
                        git_commit = EXCLUDED.git_commit,
                        completed_at = EXCLUDED.completed_at,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING (xmax = 0) as inserted
                `;

                const values = [
                    task.id,
                    task.title,
                    task.agent,
                    task.priority || 'P1',
                    task.due ? new Date(task.due) : null,
                    task.status || 'pending',
                    task.project,
                    task.description || null,
                    task.gitCommit || null,
                    task.completedAt ? new Date(task.completedAt) : null
                ];

                const result = await this.client.query(query, values);
                if (result.rows[0].inserted) {
                    this.stats.tasks.inserted++;
                } else {
                    this.stats.tasks.updated++;
                }
            } catch (err) {
                console.error(`❌ Error migrating task ${task.id}:`, err.message);
                this.stats.tasks.errors++;
            }
        }

        console.log(`✅ Tasks: ${this.stats.tasks.inserted} inserted, ${this.stats.tasks.updated} updated, ${this.stats.tasks.errors} errors`);
    }

    async migrateActivityLog() {
        console.log('\n📦 Migrating activity log...');
        const data = this.loadJson('activity-log.json');
        if (!data || !data.log) {
            console.log('⚠️  No activity log data found');
            return;
        }

        for (const entry of data.log) {
            try {
                await this.client.query(`
                    INSERT INTO activity_log (timestamp, agent, action, details, project, type)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT DO NOTHING
                `, [
                    new Date(entry.timestamp),
                    entry.agent,
                    entry.action,
                    entry.details,
                    entry.project,
                    entry.type || 'system'
                ]);
                this.stats.activityLog.inserted++;
            } catch (err) {
                console.error(`❌ Error migrating activity log entry:`, err.message);
                this.stats.activityLog.errors++;
            }
        }

        console.log(`✅ Activity log: ${this.stats.activityLog.inserted} inserted, ${this.stats.activityLog.errors} errors`);
    }

    async migrateTokens() {
        console.log('\n📦 Migrating token usage...');
        const data = this.loadJson('tokens.json');
        if (!data || !data.agents) {
            console.log('⚠️  No token data found');
            return;
        }

        for (const agent of data.agents) {
            try {
                await this.client.query(`
                    INSERT INTO token_usage (agent, tokens, cost, sessions, avg_per_session, status)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT DO NOTHING
                `, [
                    agent.name,
                    agent.tokens || 0,
                    agent.cost || 0,
                    agent.sessions || 0,
                    agent.avgPerSession || 0,
                    agent.status || 'active'
                ]);
                this.stats.tokens.inserted++;
            } catch (err) {
                console.error(`❌ Error migrating token data for ${agent.name}:`, err.message);
                this.stats.tokens.errors++;
            }
        }

        // Migrate daily history
        if (data.dailyHistory) {
            for (const day of data.dailyHistory) {
                try {
                    await this.client.query(`
                        INSERT INTO token_daily_history (date, tokens, cost)
                        VALUES ($1, $2, $3)
                        ON CONFLICT (date) DO UPDATE SET
                            tokens = EXCLUDED.tokens,
                            cost = EXCLUDED.cost
                    `, [new Date(day.date), day.tokens, day.cost]);
                } catch (err) {
                    console.error(`❌ Error migrating daily history for ${day.date}:`, err.message);
                }
            }
        }

        console.log(`✅ Token usage: ${this.stats.tokens.inserted} inserted, ${this.stats.tokens.errors} errors`);
    }

    async migrateSessions() {
        console.log('\n📦 Migrating sessions...');
        const data = this.loadJson('sessions.json');
        if (!data || !data.sessions) {
            console.log('⚠️  No sessions data found');
            return;
        }

        for (const session of data.sessions) {
            try {
                await this.client.query(`
                    INSERT INTO sessions (session_key, agent, started_at, ended_at, tokens_used, status)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (session_key) DO NOTHING
                `, [
                    session.sessionKey,
                    session.agent,
                    new Date(session.startedAt),
                    session.endedAt ? new Date(session.endedAt) : null,
                    session.tokensUsed || 0,
                    session.status || 'completed'
                ]);
                this.stats.sessions.inserted++;
            } catch (err) {
                console.error(`❌ Error migrating session:`, err.message);
                this.stats.sessions.errors++;
            }
        }

        console.log(`✅ Sessions: ${this.stats.sessions.inserted} inserted, ${this.stats.sessions.errors} errors`);
    }

    async migrateResearch() {
        console.log('\n📦 Migrating research index...');
        const data = this.loadJson('research-index.json');
        if (!data || !data.items) {
            console.log('⚠️  No research data found');
            return;
        }

        for (const item of data.items) {
            try {
                const result = await this.client.query(`
                    INSERT INTO research_items (topic, category, source_url, summary, file_path, word_count, status, assigned_agent)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    ON CONFLICT DO NOTHING
                    RETURNING id
                `, [
                    item.topic,
                    item.category,
                    item.sourceUrl,
                    item.summary,
                    item.filePath,
                    item.wordCount,
                    item.status || 'pending',
                    item.assignedAgent
                ]);

                if (result.rows.length > 0 && item.tags) {
                    for (const tag of item.tags) {
                        await this.client.query(`
                            INSERT INTO research_tags (research_id, tag)
                            VALUES ($1, $2)
                            ON CONFLICT DO NOTHING
                        `, [result.rows[0].id, tag]);
                    }
                }

                this.stats.research.inserted++;
            } catch (err) {
                console.error(`❌ Error migrating research item:`, err.message);
                this.stats.research.errors++;
            }
        }

        console.log(`✅ Research items: ${this.stats.research.inserted} inserted, ${this.stats.research.errors} errors`);
    }

    async migrateKanban() {
        console.log('\n📦 Migrating kanban board...');
        const data = this.loadJson('kanban.json');
        if (!data || !data.boards) {
            console.log('⚠️  No kanban data found');
            return;
        }

        for (const board of data.boards) {
            try {
                const boardResult = await this.client.query(`
                    INSERT INTO kanban_boards (name, project_id)
                    VALUES ($1, $2)
                    ON CONFLICT DO NOTHING
                    RETURNING id
                `, [board.name, board.projectId]);

                if (boardResult.rows.length === 0) continue;
                const boardId = boardResult.rows[0].id;

                for (let colIndex = 0; colIndex < board.columns.length; colIndex++) {
                    const column = board.columns[colIndex];
                    const colResult = await this.client.query(`
                        INSERT INTO kanban_columns (board_id, name, position)
                        VALUES ($1, $2, $3)
                        RETURNING id
                    `, [boardId, column.name, colIndex]);

                    const columnId = colResult.rows[0].id;

                    for (let cardIndex = 0; cardIndex < column.cards.length; cardIndex++) {
                        const card = column.cards[cardIndex];
                        await this.client.query(`
                            INSERT INTO kanban_cards (column_id, task_id, title, description, position, assignee, priority, due_date)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        `, [
                            columnId,
                            card.taskId,
                            card.title,
                            card.description,
                            cardIndex,
                            card.assignee,
                            card.priority,
                            card.dueDate ? new Date(card.dueDate) : null
                        ]);
                    }
                }

                this.stats.kanban.inserted++;
            } catch (err) {
                console.error(`❌ Error migrating kanban board:`, err.message);
                this.stats.kanban.errors++;
            }
        }

        console.log(`✅ Kanban boards: ${this.stats.kanban.inserted} inserted, ${this.stats.kanban.errors} errors`);
    }

    async verifyMigration() {
        console.log('\n🔍 Verifying migration...');
        
        const checks = [
            { table: 'agents', query: 'SELECT COUNT(*) as count FROM agents' },
            { table: 'projects', query: 'SELECT COUNT(*) as count FROM projects' },
            { table: 'tasks', query: 'SELECT COUNT(*) as count FROM tasks' },
            { table: 'activity_log', query: 'SELECT COUNT(*) as count FROM activity_log' },
            { table: 'token_usage', query: 'SELECT COUNT(*) as count FROM token_usage' },
        ];

        for (const check of checks) {
            try {
                const result = await this.client.query(check.query);
                console.log(`  ✅ ${check.table}: ${result.rows[0].count} records`);
            } catch (err) {
                console.error(`  ❌ ${check.table}: ${err.message}`);
            }
        }
    }

    async saveState() {
        const state = {
            migratedAt: new Date().toISOString(),
            stats: this.stats,
            status: 'completed'
        };
        fs.writeFileSync(MIGRATION_STATE_FILE, JSON.stringify(state, null, 2));
        console.log(`\n💾 Migration state saved to ${MIGRATION_STATE_FILE}`);
    }

    async run() {
        console.log('🚀 Starting Mission Control v2.0 Data Migration\n');
        
        try {
            await this.connect();
            
            // Run migrations in order
            await this.migrateAgents();
            await this.migrateProjects();
            await this.migrateTasks();
            await this.migrateActivityLog();
            await this.migrateTokens();
            await this.migrateSessions();
            await this.migrateResearch();
            await this.migrateKanban();
            
            await this.verifyMigration();
            await this.saveState();
            
            console.log('\n✨ Migration completed successfully!');
            console.log('\n📊 Summary:');
            console.log(JSON.stringify(this.stats, null, 2));
            
        } catch (err) {
            console.error('\n❌ Migration failed:', err.message);
            console.error(err.stack);
            process.exit(1);
        } finally {
            await this.disconnect();
        }
    }
}

// Run migration if executed directly
if (require.main === module) {
    const migrator = new DataMigrator();
    migrator.run();
}

module.exports = DataMigrator;