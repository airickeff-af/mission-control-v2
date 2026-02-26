/**
 * Real-Time Agent Analytics Tracker
 * Tracks actual task completion, response times, and success/failure
 */

const AnalyticsTracker = {
  version: '1.0.0',
  startDate: '2026-02-26',
  
  // Track task start
  trackTaskStart(taskId, agentName, priority) {
    const startTime = Date.now();
    const taskData = {
      taskId,
      agentName,
      priority,
      startTime,
      status: 'in-progress'
    };
    
    // Store in session storage for now (will be persisted)
    const activeTasks = JSON.parse(sessionStorage.getItem('mc_active_tasks') || '{}');
    activeTasks[taskId] = taskData;
    sessionStorage.setItem('mc_active_tasks', JSON.stringify(activeTasks));
    
    console.log(`[Analytics] Task ${taskId} started by ${agentName}`);
    return startTime;
  },
  
  // Track task completion
  trackTaskComplete(taskId, success = true, notes = '') {
    const activeTasks = JSON.parse(sessionStorage.getItem('mc_active_tasks') || '{}');
    const task = activeTasks[taskId];
    
    if (!task) {
      console.warn(`[Analytics] Task ${taskId} not found for completion tracking`);
      return null;
    }
    
    const endTime = Date.now();
    const responseTime = Math.round((endTime - task.startTime) / 1000 / 60); // in minutes
    
    const completionData = {
      ...task,
      endTime,
      responseTime,
      success,
      notes,
      date: new Date().toISOString().split('T')[0],
      hour: new Date().getHours()
    };
    
    // Add to completed tasks
    const completedTasks = JSON.parse(sessionStorage.getItem('mc_completed_tasks') || '[]');
    completedTasks.push(completionData);
    sessionStorage.setItem('mc_completed_tasks', JSON.stringify(completedTasks));
    
    // Remove from active
    delete activeTasks[taskId];
    sessionStorage.setItem('mc_active_tasks', JSON.stringify(activeTasks));
    
    // Update agent stats
    this.updateAgentStats(task.agentName, success, responseTime);
    
    console.log(`[Analytics] Task ${taskId} completed in ${responseTime}min (Success: ${success})`);
    return completionData;
  },
  
  // Update agent statistics
  updateAgentStats(agentName, success, responseTime) {
    const agentStats = JSON.parse(sessionStorage.getItem('mc_agent_stats') || '{}');
    
    if (!agentStats[agentName]) {
      agentStats[agentName] = {
        tasksCompleted: 0,
        tasksFailed: 0,
        totalResponseTime: 0,
        avgResponseTime: 0,
        successRate: 0,
        history: []
      };
    }
    
    const stats = agentStats[agentName];
    stats.tasksCompleted++;
    if (!success) stats.tasksFailed++;
    stats.totalResponseTime += responseTime;
    stats.avgResponseTime = Math.round(stats.totalResponseTime / stats.tasksCompleted);
    stats.successRate = ((stats.tasksCompleted - stats.tasksFailed) / stats.tasksCompleted * 100).toFixed(1);
    
    // Add to history
    stats.history.push({
      date: new Date().toISOString(),
      responseTime,
      success
    });
    
    sessionStorage.setItem('mc_agent_stats', JSON.stringify(agentStats));
  },
  
  // Get real metrics for an agent
  getAgentMetrics(agentName) {
    const agentStats = JSON.parse(sessionStorage.getItem('mc_agent_stats') || '{}');
    return agentStats[agentName] || null;
  },
  
  // Get all metrics
  getAllMetrics() {
    return {
      agents: JSON.parse(sessionStorage.getItem('mc_agent_stats') || '{}'),
      completedTasks: JSON.parse(sessionStorage.getItem('mc_completed_tasks') || '[]'),
      activeTasks: JSON.parse(sessionStorage.getItem('mc_active_tasks') || '{}')
    };
  },
  
  // Export metrics for dashboard
  exportForDashboard() {
    const metrics = this.getAllMetrics();
    const agents = [];
    
    Object.entries(metrics.agents).forEach(([name, stats]) => {
      agents.push({
        name,
        tasksCompleted: stats.tasksCompleted,
        tasksFailed: stats.tasksFailed,
        avgResponseTime: stats.avgResponseTime,
        successRate: parseFloat(stats.successRate),
        isRealData: true
      });
    });
    
    return {
      agents,
      totalTasks: metrics.completedTasks.length,
      isRealData: true,
      collectionStarted: this.startDate
    };
  },
  
  // Clear all data (for testing)
  clearAll() {
    sessionStorage.removeItem('mc_active_tasks');
    sessionStorage.removeItem('mc_completed_tasks');
    sessionStorage.removeItem('mc_agent_stats');
    console.log('[Analytics] All tracking data cleared');
  }
};

// Auto-track subagent spawns if in main session
if (typeof window !== 'undefined' && window.location.pathname.includes('agent-analytics')) {
  console.log('[Analytics] Tracker loaded. Collection started:', AnalyticsTracker.startDate);
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsTracker;
}