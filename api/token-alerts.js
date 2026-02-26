/**
 * Vercel Serverless API: /api/token-alerts.js
 * Token Usage Alert System API Endpoint
 * Returns current alert status and history
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  THRESHOLDS: {
    WARNING: 200000,
    CRITICAL: 250000
  },
  ALERT_STATE_FILE: '/tmp/token-alerts-state.json',
  HISTORY_FILE: '/tmp/token-usage-history.jsonl'
};

// Load alert state
function loadAlertState() {
  try {
    if (fs.existsSync(CONFIG.ALERT_STATE_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG.ALERT_STATE_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading alert state:', e.message);
  }
  return {
    lastAlertLevel: null,
    lastAlertTime: null,
    totalTokensAtLastAlert: 0,
    alertHistory: []
  };
}

// Load usage history
function loadUsageHistory(limit = 24) {
  const history = [];
  try {
    if (fs.existsSync(CONFIG.HISTORY_FILE)) {
      const lines = fs.readFileSync(CONFIG.HISTORY_FILE, 'utf-8')
        .split('\n')
        .filter(line => line.trim())
        .slice(-limit);
      
      for (const line of lines) {
        try {
          history.push(JSON.parse(line));
        } catch (e) {}
      }
    }
  } catch (e) {
    console.error('Error loading history:', e.message);
  }
  return history;
}

// Determine alert level
function determineAlertLevel(tokenCount) {
  if (tokenCount >= CONFIG.THRESHOLDS.CRITICAL) return 'CRITICAL';
  if (tokenCount >= CONFIG.THRESHOLDS.WARNING) return 'WARNING';
  return 'NORMAL';
}

// Fetch token data from tokens API
async function fetchTokenData() {
  // In serverless, we can't require the tokens.js file directly
  // Instead, we'll return a simplified response that the frontend
  // will combine with the tokens API call
  return {
    thresholds: CONFIG.THRESHOLDS,
    timestamp: new Date().toISOString()
  };
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const alertState = loadAlertState();
    const history = loadUsageHistory();
    
    // Calculate stats from history
    let currentTokens = 0;
    if (history.length > 0) {
      currentTokens = history[history.length - 1].totalTokens;
    }
    
    const level = determineAlertLevel(currentTokens);
    
    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      alertStatus: {
        level,
        currentTokens,
        thresholds: CONFIG.THRESHOLDS,
        remainingToWarning: Math.max(0, CONFIG.THRESHOLDS.WARNING - currentTokens),
        remainingToCritical: Math.max(0, CONFIG.THRESHOLDS.CRITICAL - currentTokens),
        percentageOfCritical: Math.min((currentTokens / CONFIG.THRESHOLDS.CRITICAL) * 100, 100)
      },
      alertState: {
        lastAlertLevel: alertState.lastAlertLevel,
        lastAlertTime: alertState.lastAlertTime,
        totalAlerts: alertState.alertHistory.length
      },
      alertHistory: alertState.alertHistory.slice(-20),
      usageHistory: history,
      config: {
        warningThreshold: CONFIG.THRESHOLDS.WARNING,
        criticalThreshold: CONFIG.THRESHOLDS.CRITICAL
      }
    });
  } catch (error) {
    console.error('Error in token-alerts API:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
