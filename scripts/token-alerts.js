#!/usr/bin/env node
/**
 * Token Usage Alert System
 * MC-P0-012: Proactive alerts when token usage approaches limits
 * 
 * Thresholds:
 * - 200k tokens = Warning
 * - 250k tokens = Critical
 * 
 * Usage: node token-alerts.js [--test]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Alert thresholds (DAILY - based on daily average, not total historical)
  THRESHOLDS: {
    WARNING: 200000,   // 200k tokens per day
    CRITICAL: 250000   // 250k tokens per day
  },
  
  // Alternative: Check current day's usage
  USE_DAILY_USAGE: true,
  
  // File paths
  ALERT_STATE_FILE: '/root/.openclaw/workspace/mission-control-v2/data/token-alerts-state.json',
  HISTORY_FILE: '/root/.openclaw/workspace/mission-control-v2/data/token-usage-history.jsonl',
  
  // API endpoint for token data
  TOKENS_API_URL: 'https://dashboard-ten-sand-20.vercel.app/api/tokens',
  
  // Alert cooldown (don't spam - 30 minutes between same alert type)
  ALERT_COOLDOWN_MS: 30 * 60 * 1000,
  
  // Telegram settings
  TELEGRAM: {
    CHAT_ID: '1508346957', // EricF's Telegram ID from USER.md
    BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || ''
  }
};

// Alert state management
class AlertState {
  constructor() {
    this.state = this.load();
  }
  
  load() {
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
  
  save() {
    try {
      const dir = path.dirname(CONFIG.ALERT_STATE_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(CONFIG.ALERT_STATE_FILE, JSON.stringify(this.state, null, 2));
    } catch (e) {
      console.error('Error saving alert state:', e.message);
    }
  }
  
  recordAlert(level, tokenCount) {
    this.state.lastAlertLevel = level;
    this.state.lastAlertTime = Date.now();
    this.state.totalTokensAtLastAlert = tokenCount;
    this.state.alertHistory.push({
      level,
      tokenCount,
      timestamp: new Date().toISOString()
    });
    // Keep only last 100 alerts
    if (this.state.alertHistory.length > 100) {
      this.state.alertHistory = this.state.alertHistory.slice(-100);
    }
    this.save();
  }
  
  shouldAlert(level) {
    // Always alert if level increased
    if (level === 'CRITICAL' && this.state.lastAlertLevel !== 'CRITICAL') {
      return true;
    }
    
    // Check cooldown for same level
    if (this.state.lastAlertLevel === level && this.state.lastAlertTime) {
      const elapsed = Date.now() - this.state.lastAlertTime;
      if (elapsed < CONFIG.ALERT_COOLDOWN_MS) {
        return false;
      }
    }
    
    return true;
  }
  
  getCooldownRemaining() {
    if (!this.state.lastAlertTime) return 0;
    const elapsed = Date.now() - this.state.lastAlertTime;
    const remaining = CONFIG.ALERT_COOLDOWN_MS - elapsed;
    return Math.max(0, remaining);
  }
}

// Fetch token data from API
async function fetchTokenData() {
  // First try to use local tokens.js module
  try {
    const tokensModule = require('/root/.openclaw/workspace/api/tokens.js');
    
    // Create mock req/res for the module
    const mockRes = {
      setHeader: () => {},
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.responseData = data;
      },
      responseData: null
    };
    
    const mockReq = {
      url: '/api/tokens?refresh=true',
      headers: { host: 'localhost' }
    };
    
    tokensModule(mockReq, mockRes);
    
    if (mockRes.responseData && mockRes.responseData.success) {
      return mockRes.responseData;
    }
  } catch (localError) {
    console.log('   Local token module not available, trying API...');
  }
  
  // Fall back to API call
  try {
    const response = await fetch(`${CONFIG.TOKENS_API_URL}?refresh=true`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'API returned error');
    }
    
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch token data: ${error.message}`);
  }
}

// Determine alert level based on token count
function determineAlertLevel(tokenCount) {
  if (tokenCount >= CONFIG.THRESHOLDS.CRITICAL) {
    return 'CRITICAL';
  } else if (tokenCount >= CONFIG.THRESHOLDS.WARNING) {
    return 'WARNING';
  }
  return 'NORMAL';
}

// Format numbers for display
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

// Send Telegram alert
async function sendTelegramAlert(level, tokenData) {
  const tokenCount = tokenData.summary.totalTokens;
  const cost = tokenData.summary.totalCost;
  const activeAgents = tokenData.summary.activeAgents;
  
  let emoji, title, message;
  
  if (level === 'CRITICAL') {
    emoji = '🚨';
    title = 'CRITICAL: Token Limit Approaching!';
    message = `Token usage has reached CRITICAL levels!\n\n` +
              `Current Usage: ${formatNumber(tokenCount)} tokens\n` +
              `Critical Threshold: ${formatNumber(CONFIG.THRESHOLDS.CRITICAL)} tokens\n` +
              `Overage: ${formatNumber(tokenCount - CONFIG.THRESHOLDS.CRITICAL)} tokens\n\n` +
              `💰 Estimated Cost: $${cost.toFixed(4)}\n` +
              `👥 Active Agents: ${activeAgents}\n\n` +
              `⚠️ ACTION REQUIRED: Consider pausing non-essential agents.`;
  } else if (level === 'WARNING') {
    emoji = '⚠️';
    title = 'WARNING: Token Usage High';
    message = `Token usage is approaching warning threshold.\n\n` +
              `Current Usage: ${formatNumber(tokenCount)} tokens\n` +
              `Warning Threshold: ${formatNumber(CONFIG.THRESHOLDS.WARNING)} tokens\n` +
              `Remaining to Critical: ${formatNumber(CONFIG.THRESHOLDS.CRITICAL - tokenCount)} tokens\n\n` +
              `💰 Estimated Cost: $${cost.toFixed(4)}\n` +
              `👥 Active Agents: ${activeAgents}\n\n` +
              `📊 Monitor usage at: https://dashboard-ten-sand-20.vercel.app/tokens.html`;
  } else {
    return; // No alert for normal
  }
  
  const fullMessage = `${emoji} *${title}* ${emoji}\n\n${message}`;
  
  // Log to console (for now - Telegram integration can be added)
  console.log('\n' + '='.repeat(60));
  console.log(fullMessage);
  console.log('='.repeat(60) + '\n');
  
  // Send via Telegram if bot token is available
  if (CONFIG.TELEGRAM.BOT_TOKEN) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CONFIG.TELEGRAM.CHAT_ID,
          text: fullMessage,
          parse_mode: 'Markdown'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status}`);
      }
      
      console.log('✅ Telegram alert sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to send Telegram alert:', error.message);
      return false;
    }
  } else {
    console.log('ℹ️  Telegram bot token not configured. Alert logged to console only.');
    console.log('To enable Telegram alerts, set TELEGRAM_BOT_TOKEN environment variable.');
    return false;
  }
}

// Record usage to history file
function recordUsage(tokenData) {
  try {
    const record = {
      timestamp: new Date().toISOString(),
      totalTokens: tokenData.summary.totalTokens,
      totalCost: tokenData.summary.totalCost,
      activeAgents: tokenData.summary.activeAgents,
      totalSessions: tokenData.summary.totalSessions,
      dailyAverage: tokenData.summary.dailyAverage
    };
    
    const line = JSON.stringify(record) + '\n';
    
    const dir = path.dirname(CONFIG.HISTORY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.appendFileSync(CONFIG.HISTORY_FILE, line);
    console.log(`📊 Usage recorded: ${formatNumber(record.totalTokens)} tokens`);
  } catch (e) {
    console.error('Error recording usage:', e.message);
  }
}

// Main monitoring function
async function monitorTokens(options = {}) {
  console.log('🔍 Token Usage Alert System - Starting check...');
  console.log(`   Warning Threshold: ${formatNumber(CONFIG.THRESHOLDS.WARNING)}`);
  console.log(`   Critical Threshold: ${formatNumber(CONFIG.THRESHOLDS.CRITICAL)}`);
  console.log('');
  
  const alertState = new AlertState();
  
  try {
    // Fetch current token data
    console.log('📡 Fetching token data from API...');
    const tokenData = await fetchTokenData();
    
    const tokenCount = tokenData.summary.dailyAverage || tokenData.summary.totalTokens;
    const level = determineAlertLevel(tokenCount);
    
    console.log(`📊 Current Usage: ${formatNumber(tokenCount)} tokens`);
    console.log(`📈 Alert Level: ${level}`);
    console.log(`💰 Estimated Cost: $${tokenData.summary.totalCost.toFixed(4)}`);
    console.log(`👥 Active Agents: ${tokenData.summary.activeAgents}/${tokenData.summary.totalAgents}`);
    console.log('');
    
    // Record usage to history
    recordUsage(tokenData);
    
    // Check if we should send an alert
    if (level !== 'NORMAL') {
      if (alertState.shouldAlert(level)) {
        console.log(`🚨 Alert condition met: ${level} (Daily Average: ${formatNumber(tokenCount)} tokens)`);
        await sendTelegramAlert(level, tokenData);
        alertState.recordAlert(level, tokenCount);
      } else {
        const cooldown = Math.ceil(alertState.getCooldownRemaining() / 60000);
        console.log(`⏳ Alert on cooldown. ${cooldown} minutes remaining.`);
      }
    } else {
      console.log(`✅ Token usage within normal limits (Daily Average: ${formatNumber(tokenCount)} tokens)`);
    }
    
    // Test mode - simulate alerts
    if (options.test) {
      console.log('\n🧪 TEST MODE: Simulating alerts...');
      
      // Simulate WARNING (daily average)
      const warningData = {
        summary: {
          totalTokens: 5000000,
          totalCost: 2.50,
          activeAgents: 15,
          totalAgents: 22,
          totalSessions: 45,
          dailyAverage: 210000  // Above 200k warning threshold
        }
      };
      console.log('\n--- Simulating WARNING alert (Daily: 210K tokens) ---');
      await sendTelegramAlert('WARNING', warningData);
      
      // Simulate CRITICAL (daily average)
      const criticalData = {
        summary: {
          totalTokens: 6000000,
          totalCost: 3.00,
          activeAgents: 18,
          totalAgents: 22,
          totalSessions: 52,
          dailyAverage: 265000  // Above 250k critical threshold
        }
      };
      console.log('\n--- Simulating CRITICAL alert (Daily: 265K tokens) ---');
      await sendTelegramAlert('CRITICAL', criticalData);
    }
    
    return {
      success: true,
      level,
      tokenCount,
      alertSent: level !== 'NORMAL' && alertState.shouldAlert(level)
    };
    
  } catch (error) {
    console.error('❌ Error during monitoring:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const testMode = args.includes('--test');
  
  monitorTokens({ test: testMode }).then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { monitorTokens, AlertState, CONFIG, determineAlertLevel };
