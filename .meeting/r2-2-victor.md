# Victor Critique & Revised Proposal — Round 2

## Where They're Wrong / Missing Something

| Participant | Miss / Error | My Take |
|-------------|--------------|---------|
| **Chair** | Copied my idea but watered it down — "chat interface in sidebar" is a toy. The real value is **proactive intervention during study**, not reactive chat. Also ignores Skeptic's architecture warning. | Chair validated the *direction* but missed the *execution*. A sidebar chat won't move retention. |
| **Skeptic** | Right about the 44K-line monolith. Wrong that we must choose: **refactor AND ship the coach in parallel**. The coach *forces* the modularization (it needs clean APIs). Refactor alone ships nothing users see. | Skeptic protects the codebase; I protect the business. We do both — coach is the *forcing function* for the refactor. |
| **Simplifier** | "One card, one tap" is a widget, not a product. Students already have `DailyPlanView` — adding a card doesn't solve *what to study when the plan is wrong*. Deterministic rules can't adapt to "I bombed Physics yesterday." | Simplifier optimizes for code minimalism. I optimize for *student outcome*. The card is a UI pattern; the engine is the product. |
| **User Advocate** | Over-scoped: weekly plan + rationale panel + parent briefs + spaced repetition = 5 features, 2-3 weeks. Will ship late, buggy, or both. Also: **parents don't pay — students do**. | User Advocate lists pain points correctly but bundles solutions. We sequence: coach first, spaced repetition v2, parent briefs v3. |

---

## Revised Proposal: **AI Study Coach — The "Iron Man" Architecture**

### Core Insight
The coach isn't a feature. It's an **architecture** that sits *between* the student and every existing view (Plan, Timer, Habits, Analytics). It owns the *decision layer*; the views own *presentation*.

### Three-Layer Design

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION (existing views, unchanged)                   │
│  DailyPlanView │ TimerView │ HabitsView │ Analytics │ ...   │
└─────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────▼─────────────┐
              │   DECISION LAYER (NEW)    │
              │  CoachService (stateless) │
              │  - nextTask(student, now) │
              │  - nudge(student, ctx)    │
              │  - replan(student, trigger)│
              └─────────────┬─────────────┘
                            │
              ┌─────────────▼─────────────┐
              │   DATA LAYER (refactored) │
              │  StudentRepo  TaskRepo    │
              │  ReportRepo   HabitRepo   │
              │  (clean interfaces)       │
              └───────────────────────────┘
```

### What Changes From Round 1

| Round 1 | Round 2 (Revised) |
|---------|-------------------|
| Nightly micro-plan | **On-demand `nextTask()`** — called when student opens Plan, finishes session, or hits nudge |
| In-session nudges | **Event-driven** — Timer heartbeat → `nudge(ctx)` → WebSocket push (no polling) |
| Counselor review screen | **Diff API** — `replan()` returns `{oldPlan, newPlan, rationale}`; CounselorView renders diff |
| GenAI for everything | **Hybrid**: deterministic rules for safety (max hours, breaks, curriculum graph); LLM only for *rationale text* and *quiz generation* |
| 2 devs × 8 weeks | **1 backend dev + 1 frontend dev × 6 weeks** — CoachService is ~500 lines, thin over existing data |

### The Refactor-for-Free Trick
CoachService *requires* clean repos. We extract:
- `TaskRepo` (from server.ts lines 1200-2100)
- `ReportRepo` (lines 2100-2800)
- `StudentRepo` (lines 800-1200)

Each gets an interface + implementation + integration tests. **The coach pays for the refactor.**

### First Slice (Week 1-2) — Unchanged
1. `nextTask()` deterministic v1 (rules only, no LLM)
2. `nudge()` WebSocket endpoint + Timer heartbeat integration
3. `TaskRepo` / `ReportRepo` interfaces + test coverage

### Success Metrics (Sharpened)
- **Week 2**: `nextTask()` matches counselor manual pick ≥ 80% on historical data
- **Week 4**: Nudge acceptance rate (student acts on nudge) ≥ 35%
- **Week 6**: Session completion rate ↑ 15% vs. control (A/B on coach-enabled flag)

### Risk Mitigation (Concrete)
| Risk | Mitigation |
|------|------------|
| Hallucinated task | Deterministic rule engine only; LLM output = markdown string, never executed |
| Token cost | LLM calls capped at 2/student/day (rationale + optional quiz); cached 24h |
| Coach breaks plan | `replan()` returns diff; student *must* confirm before apply |
| 44K-line server.ts | CoachService forces repo extraction — refactor is non-optional |

---

## Victor's Vote
**Ship the Coach. Use it to force the refactor. Ignore the sidebar chat. Ignore the weekly plan. Build the decision layer that makes every existing view smarter.**

The Skeptic's fear (spaghetti code) and the Simplifier's virtue (minimal code) and the User Advocate's pain points (what do I study?) all converge here: **a thin, testable decision service that owns "what's next."** That's the product. Everything else is UI.