# Round 1 — User Advocate Proposal

## The Next Developing Idea: **AI-Adaptive Personalized Study Engine**

### What I'd Do
Build an **AI-powered adaptive study planner** that generates daily/weekly study plans tailored to each student's:
- **Performance gaps** (from session reports, test results, diagnostic dashboard)
- **Time remaining** until Konkur (countdown-aware pacing)
- **Energy patterns** (when they focus best, streak data, habit consistency)
- **Subject priorities** (weak areas get more slots; strong areas get maintenance)

The engine replaces the manual "Daily Plan" with a **living schedule** that rebalances nightly via the existing Google GenAI integration.

### Why (User Pain Points)
| Pain Point | Current Gap | Engine Solves |
|------------|-------------|---------------|
| "What do I study today?" | Manual planning, guesswork | AI picks highest-impact tasks |
| "I'm falling behind in Math" | No auto-detection of weak spots | Diagnostic weights → adaptive allocation |
| "Burnout before Konkur" | Fixed rigid schedule | Energy-aware load balancing + wellness nudges |
| "Parents want progress proof" | Only raw FP/streak numbers | Auto-generated weekly progress brief for parents |
| "I forget what I studied last month" | No spaced repetition | Built-in review cycles using FSRS/SM-2 |

### What It Costs
- **Backend**: New `/api/study-plan/generate` endpoint (POST), nightly cron job, prompt engineering for GenAI
- **Frontend**: Replace `DailyPlanView` with `AdaptivePlanView` (accepts AI plan, allows manual override), add "Plan Rationale" panel
- **Data**: Leverage existing `tasks`, `reports`, `diagnosticWeights`, `streak`, `habitLogs` — no new tables
- **Effort**: ~2-3 weeks (1 backend, 1 frontend, 1 prompt tuning/integration)
- **Risk**: Low — additive feature, manual override preserves user agency

### Success Metrics (User-Centric)
1. **Plan adherence rate** ↑ from ~60% → 80% (users follow AI plan vs. abandon manual)
2. **Weak-subject improvement** ↑ 15% in diagnostic scores over 4 weeks
3. **Burnout signals** (streak breaks >3 days) ↓ 30%
4. **Parent satisfaction** — measurable via "Share Progress" usage

### My Vote
**Do this first.** It touches every student daily, compounds over the Konkur timeline, and uses existing AI infra. Everything else (social, mock exams, wellness) layers on top of a solid adaptive plan.