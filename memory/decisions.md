# Key Decisions Archive

## 2026-02-17

### Decision: Consolidate Agent Heartbeats
**Context:** 8 agents each sending heartbeats created too much noise (~27 notifications/hour)
**Decision:** Consolidate into single Nexus heartbeat with rotation
**Impact:** ~70% noise reduction, ~2 notifications/hour
**Rationale:** EricF prefers fewer, higher-quality updates
**Status:** ✅ Implemented

---

### Decision: Reduce Cron Job Count
**Context:** Overlapping cron jobs (proactive-improvements, ericf-life-improvement, self-improvement)
**Decision:** Disable redundant jobs, keep single self-improvement cycle
**Impact:** 18% reduction (11 → 9 jobs)
**Rationale:** Same work being done multiple times
**Status:** ✅ Implemented

---

### Decision: Memory Preservation Architecture
**Context:** Main session at 90% capacity (235k/262k tokens)
**Decision:** Multi-layer system with never-delete policy
**Layers:**
1. Real-time stream capture
2. Daily consolidation
3. Topic-based archives
4. Vector search index
5. Cold storage backup
**Rationale:** EricF never wants to forget anything
**Status:** 🔄 Implementing (P1)

---

### Decision: Executive Authority Threshold
**Context:** EricF may be unavailable for hours
**Decision:** 3-hour threshold for autonomous decisions
**Powers:** Approve tasks, fix blockers, deploy features
**Constraints:** Log all decisions, inform on return
**Rationale:** Maintain momentum without waiting
**Status:** ✅ Active

---

## 2026-02-18

### Decision: Build Email + Social Verification
**Context:** Audit found contact emails are pattern-based, not verified
**Decision:** Build verification modules for DealFlow
**Components:**
- Email: syntax, disposable detection, MX validation
- Social: Twitter, LinkedIn, GitHub profile verification
**Rationale:** Improve lead quality, increase outreach success
**Status:** ✅ Built, pending integration
