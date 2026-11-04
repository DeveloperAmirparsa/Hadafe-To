# Round 1 — Simplifier Proposal

## The Next Developing Idea: **Smart Daily Nudge (One Screen, One Tap)**

### What I'd Do
Ship a **single-screen "Today" view** that shows the *one next task* the student should do, derived from rules already in the codebase — no new AI endpoint, no cron, no prompt engineering.

- **Source of truth**: existing `tasks` + `diagnosticWeights` + `streak` + `habitLogs`
- **Logic**: deterministic, client-side (or 10-line server helper):
  1. Overdue/incomplete tasks first
  2. Weakest subject by `diagnosticWeights` (already calculated)
  3. Time-box to today's available hours (from `habitLogs` median)
  4. Output: **one card** — subject, topic, estimated minutes, "Start" button
- **Override**: user can swipe to next suggestion or pick manually (preserves agency)

### Why (Simplicity First)
| User Advocate Engine | Smart Daily Nudge |
|----------------------|-------------------|
| New `/api/study-plan/generate` | **Zero new endpoints** |
| Nightly cron + GenAI prompt tuning | **Client-side rules, runs instantly** |
| `AdaptivePlanView` + "Plan Rationale" panel | **Reuses `DailyPlanView` + 1 new card component** |
| 2–3 weeks, 3 people | **3–5 days, 1 frontend dev** |
| Spaced repetition (FSRS/SM-2) | **Defer — v2 if adherence proves out** |
| Parent progress briefs | **Defer — share existing streak/FP via link** |

**Core insight**: Students don't need a *weekly plan* they'll ignore. They need *one clear next step* they'll actually start. The rest is decoration.

### What It Costs
- **Frontend only**: ~1 new component (`NextTaskCard`), ~200 lines TSX, reuse all existing hooks/stores
- **Backend**: **none** (optional 10-line helper if we want server-side tie-break)
- **Data**: zero schema changes — reads existing `tasks`, `diagnosticWeights`, `habitLogs`
- **Effort**: **3–5 days, 1 person**
- **Risk**: near-zero — additive, reversible, no AI hallucination surface

### Success Metrics (Simplifier-Centric)
1. **Tap-through rate** on "Start" button > 40% (they actually begin)
2. **Session completion** after tap > 70% (they finish what they start)
3. **Code added** < 300 lines (measure of restraint)
4. **Zero new dependencies** (no GenAI calls, no cron infra)

### My Vote
**Do this first — then measure.** If tap-through and completion hold, *then* invest in the adaptive engine. Most "AI study planners" fail because students never open them. This puts the decision in front of them at the moment of highest intent: app open.

### Critique of User Advocate Proposal
- **Over-engineered for v1**: weekly plan + rationale panel + parent briefs + spaced repetition = 5 features in one
- **AI dependency risk**: GenAI latency, cost, prompt drift, hallucinated tasks
- **Cron fragility**: nightly job fails → stale plan → user loses trust
- **Manual override buried**: if AI plan is wrong, user must dig to fix it — friction kills adherence