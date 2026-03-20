# CRITICAL: EricF's Requirements That Must Never Be Forgotten

## Deployment Quality Gate (P0 - NEVER FORGET)
**Status:** ✅ IMPLEMENTED 2026-02-18
**Requirement:** Audit Bot must run BEFORE every deployment
**Minimum Score:** 93/100
**Action if Failed:** Block deployment, require rework
**ORIGIN:** EricF explicitly requested this on Feb 17-18

**Implementation:**
- Git pre-push hook: `.git/hooks/pre-push`
- GitHub Actions: `.github/workflows/deploy.yml`
- Local audit: `mission-control/scripts/pre-deploy-audit.sh`
- Audit Gate: `mission-control/scripts/audit-gate.sh`

**Verification:**
- [x] Pre-push hook created
- [x] GitHub Actions workflow updated
- [x] Audit script with 93/100 threshold
- [x] Auto-block on failure

---

## Memory System Rules (P0)

### Always Check Before Responding:
1. **MEMORY.md** - Long-term requirements
2. **PENDING_TASKS.md** - Active tasks and blockers  
3. **Today's memory file** - Recent context
4. **User's prior requests** - Don't ask twice
5. **NEVER_FORGET.md** - Critical requirements

### If EricF Says "I told you this before":
- STOP immediately
- Search memory for prior request
- Acknowledge the mistake
- Fix it without asking again
- Update memory to prevent recurrence
- APOLOGIZE for forgetting

---

## Never Forget List

| # | Requirement | Date | Status |
|---|-------------|------|--------|
| 1 | Audit gate 93/100 before deploy | Feb 17-18 | ✅ Done Feb 18 |
| 2 | Vercel auto-deploy | Feb 17-18 | ✅ Done Feb 18 |
| 3 | 30-min auto-refresh dashboards | Feb 18 | ✅ Done Feb 18 |
| 4 | Working refresh buttons | Feb 18 | ✅ Done Feb 18 |
| 5 | Never repeat questions EricF answered | Ongoing | ⚠️ WATCH |

---

## Consequences of Forgetting
- Wastes EricF's time
- Repeats work unnecessarily
- Breaks trust
- Shows poor attention to detail
- Makes EricF frustrated (rightfully so)

**FIX:** Proactive memory search, not reactive.
**APOLOGY:** Immediate when caught.
**PREVENTION:** Check NEVER_FORGET.md before EVERY task.

