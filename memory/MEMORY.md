# MEMORY.md - Nexus Long-Term Memory

## About EricF

**Name:** Eric Fung  
**Timezone:** Asia/Shanghai (GMT+8)  
**Role:** Entrepreneur, Content Creator, Crypto/NFT Investor  
**Communication Style:** Direct, values efficiency, appreciates proactive assistance  

### Preferences
- **Briefings:** Concise, actionable, no fluff
- **Notifications:** Only when attention needed
- **Agent Communication:** Professional but personable
- **Visual Style:** Kairosoft games aesthetic (pixel art, chibi, colorful UI)

### Interests
- Cryptocurrency and NFT markets
- AI/ML technology trends
- Startup/entrepreneurship
- Content creation automation
- Building efficient systems

### Active Projects
1. **Mission Control** - Multi-agent AI system (deployed 2026-02-17)
2. **coins.ph / coins.xyz** - Partnership outreach (Olivia agent active - consolidated DealFlow + ColdCall)
3. **Content Creation** - Twitter/X, Medium, YouTube content pipeline
4. **Limitless Trading Bot** - Automated BTC/ETH/SOL prediction market trading (started 2026-02-26)
5. **HKSI Paper 1 Study Guide** - Comprehensive SFC licensing exam guide (completed 2026-03-14)
6. **Idle Tower Defense Game** - Kairosoft-style browser game with Meebit aesthetics (started 2026-03-14)

### Completed Projects
- **Innovation Sprint #1** - PIE, Voice Interface, Swarm Orchestrator specs completed (2026-02-18)

### Known Blockers
- Pixel (Designer) lacks image generation capability
- Larry (Social) needs API credentials for automated posting
- Gary (Marketing) needs historical data for performance analysis
- Main session context management - monitoring token usage

### LimitlessHunter Bot Configuration (Updated 2026-03-18)
- **Bot Name:** LimitlessHunter
- **Exchange:** Limitless (limitless.exchange)
- **Status:** 🤖 **FULL AUTONOMOUS MODE - ACTIVE**
- **Location:** `/agents/limitless/`
- **API Key:** Active
- **Private Key:** Stored securely
- **Wallet:** 0xd82...4037 (confirmed)
- **Balance:** $20.39 USDC
- **Trade Size:** $2.50 max per position (hard cap) *[Updated 2026-03-15 - 50% smaller]*
- **Max per Market:** $5.00 total exposure - no multiple positions on same market
- **Trading Fee:** 3% per side (tracked)
- **Fee Tracking:** Gross P&L vs Net P&L
- **Max Concurrent:** 2 positions
- **Assets:** BTC, ETH, SOL, **DOGE** (added 2026-03-15)
- **Volume Filter:** $750 minimum
- **Time Rules:**
  - **Max Entry:** 15 minutes to market expiry (all assets)
  - **Max Hold:** 14 minutes (all assets) *[Updated 2026-03-18]*
  - **Min Time:** 2 minutes to expiry
- **Market Cooldown:** 1 hour per market
- **Check Interval:** 1.0 minute (60 seconds)
- **Take Profit:** +10%
- **Stop Loss:** -7.5%
- **Early Cut:** Exit at 60s if losing
- **Last 60s Dump:** Exit losing positions before expiry **[CRITICAL FIX: Now actually submits sell orders!]**
- **Strategy:**
  - BUY YES when 67.5% < price < 92.5%
  - BUY NO when 7.5% < price < 32.5%
  - **Pricing:** Market price if vol >$20k, 2.5% discount if vol ≤$20k
- **Cooldown:** 30 min rest after 2 consecutive losses
- **Learning:** Saves all trades to `LEARNING.md`
- **Liquidity Tracking:** 15-minute granularity (volume + tradeable markets)
- **Order Type:** GTC
- **Mode:** Quiet (minimal output)
- **Chain:** Base (8453)
- **Signing:** EIP-712 with viem
- **Self-Healing:** Auto-restart on crash
- **Sell Execution:** Fixed 2026-03-18 - Now submits actual sell orders to exchange

---

## Future Bots

### PolyTrader ✅ DEPLOYED (2026-03-15)
- **Exchange:** Polymarket
- **Language:** Python 3.11+
- **Status:** ✅ Ready for trading
- **Location:** `/agents/polymarket/`
- **Strategy:** Same scalping approach as LimitlessHunter
- **Key Differences:**
  - **0% trading fees** (vs 3% on Limitless)
  - **$2 USDC max bet** (smaller than LimitlessHunter)
  - **<15 min expiry** strict filter
  - **Max 2 positions** enforced
- **Files:** `polytrader.py`, `.env`, `requirements.txt`, `README.md`

---

## System Architecture

### Mission Control Agents (11 Total)
| Agent | Role | Status | Notes |
|-------|------|--------|-------|
| Nexus (Air1ck3ff) | Orchestrator | Active | Main coordinator |
| Glasses | Researcher | Active | Daily briefings, research tasks |
| Quill | Writer | Active | Content creation |
| Pixel | Designer | Active | Needs image gen capability |
| Gary | Marketing | Active | Strategy and campaigns |
| Larry | Social | Active | Needs API credentials |
| Sentry | DevOps | Active | System monitoring |
| Audit | QA | Active | Quality reviews |
| Cipher | Security | Active | Security monitoring |
| Limitless | Trading Bot | Active | API configured, ready to trade |
| Olivia | DealFlow + Outreach | Active | Consolidated ColdCall |
| ZooKeeper | Pixel Sanctuary | Completed | Renamed from PixelSanctuary-Replacement |

### Cron Schedule Summary
- **Daily 6:45 AM:** Glasses crypto/stock briefing
- **Daily 8:00 AM:** Nexus daily briefing
- **Every 30 min:** Nexus heartbeat (consolidated)
- **Every 20 min:** Task queue check
- **Every 90 min:** Agent progress report
- **Every 1.5 hours:** Nexus self-improvement
- **Daily 2 AM:** Session archival (new)

---

## Lessons Learned

### 2026-02-17: Deployment Day
- **Win:** All 9 agents deployed successfully
- **Lesson:** Agent heartbeats create too much noise
- **Action:** Consolidated to single Nexus heartbeat with rotation

### General Principles
1. **Noise reduction > comprehensive reporting** - EricF prefers fewer, higher-quality updates
2. **Proactive > Reactive** - Anticipate needs before being asked
3. **Executive authority requires logging** - Document all autonomous decisions

---

## Active Decisions

### Pending EricF Approval
None currently.

### Autonomous Decisions Made

**Cron Optimization (2026-02-17 to 02-18):**
- Consolidated 8 redundant agent heartbeats → single Nexus heartbeat (~70% noise reduction)
- Merged 4 overlapping improvement cycles into 1 (~73% reduction, ~45k tokens/day saved)
- Disabled redundant jobs: proactive-improvements, ericf-life-improvement, heartbeat-code, heartbeat-forge, nexus-self-improvement, nexus-improvement-cycle, nexus-innovation-sprint

**System Architecture (2026-02-17):**
- Created HEARTBEAT.md for efficient periodic checks
- Created MEMORY.md for long-term knowledge retention
- Created Agent Abort Recovery Protocol
- Implemented Smart Heartbeat State Tracking with metrics
- Created Session Archival Protocol and Context Management Protocol

**Innovation & Development (2026-02-18 to 02-19):**
- Innovation Sprint #1: PIE, Voice Interface, Swarm Orchestrator specs
- DealFlow + PIE Integration Phase 1 (5 modules, 96KB)
- P0 UI Fixes Bundle (Office Page, Data Viewer, Refresh buttons)
- Pixel Office Sprite System (22 sprites, 7 animations, 60fps)
- Auto-Sync Optimization (120s→60s execution time)

---

## Innovation Backlog

See `/innovation/BACKLOG.md` for detailed feature specifications:
- **PIE** - Opportunity radar, friction prediction, autonomous micro-actions
- **Voice Interface** - Voice briefings, task delegation, agent summoning
- **Swarm Orchestrator** - Dynamic teaming, parallel execution, self-healing workflows

---

*Last Updated: 2026-03-15 7:10 AM CST*  
*Maintained by: Nexus (Air1ck3ff)*
