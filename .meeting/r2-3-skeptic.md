# Skeptic's Critique & Revision — Round 2

---

## Critiques of Others' Proposals

### Victor's AI Coach (8 weeks, 2 devs, LLM infra)
| Claim | Reality Check |
|-------|---------------|
| "90% less counselor time" | No data. Counselor workflow unvalidated. |
| "Churn ↓ 30-40%" | Industry benchmarks for *mature* AI coaches. We have 0 users on AI. |
| "Deterministic guardrails" | Guardrails = more code, more bugs. Hallucination risk on study advice = liability. |
| "WebSocket for live nudges" | New infra, new failure modes, battery drain on student phones. |

**Verdict**: **Resume-driven development**. Builds a moat for a product that doesn't retain users *yet*.

---

### User Advocate's Adaptive Engine (2-3 weeks, 3 people)
| Claim | Reality Check |
|-------|---------------|
| "Uses existing AI infra" | `@google/genai` is a dependency, not infra. No prompt versioning, no eval harness, no cost controls. |
| "No new tables" | But needs cron, new endpoint, new frontend view, prompt tuning cycles. |
| "Manual override preserves agency" | Buried in "Plan Rationale" panel — friction = abandonment. |
| "Plan adherence 60% → 80%" | Assumption. No baseline measurement exists. |

**Verdict**: **Feature salad**. 5 features bundled (weekly plan, rationale, parent briefs, spaced repetition, energy-aware). Each adds surface area for bugs.

---

### Simplifier's Smart Daily Nudge (3-5 days, 1 person)
| Strength | Concern |
|----------|---------|
| Zero new deps, deterministic, reversible | **Only works if `diagnosticWeights` are accurate** — are they? |
| Client-side, instant | Client-side = no server visibility. Can't A/B, can't debug production issues. |
| Reuses `DailyPlanView` | `DailyPlanView` may carry technical debt (untested, coupled). |

**Verdict**: **Best risk/reward** — *if* the data pipeline feeding `diagnosticWeights` is solid. I'd bet it's not.

---

## My Revised Position

### The Real Blockers (Validated by Reading All Three)
1. **No one knows if `diagnosticWeights` / `tasks` / `habitLogs` are trustworthy** — all three feature proposals assume clean data.
2. **No observability** — we can't measure adherence, completion, or tap-through in production today.
3. **44K-line server.ts** — any new endpoint (Victor, User Advocate) or helper (Simplifier) touches spaghetti.

### What I'd Do Now (Revised)
**Week 1-2: Data Audit & Instrumentation** (2 devs)
- Audit `diagnosticWeights` calculation: correctness, freshness, coverage
- Add anonymous event logging: `plan_viewed`, `task_started`, `task_completed`, `nudge_shown`, `nudge_tapped`
- Ship Simplifier's `NextTaskCard` **behind a feature flag** — measures tap-through *before* committing

**Week 3-4: Decide with Data**
- If tap-through > 40% *and* completion > 70% → build User Advocate's engine (justified)
- If not → fix data pipeline first, then re-evaluate

**Week 5+: Foundation Refactor** (parallel, 1 dev)
- Extract `study-plan` domain module from server.ts
- Add integration tests for critical paths

### What It Costs (Revised)
| Phase | Effort | Gate |
|-------|--------|------|
| Data audit + instrumentation | 1 week | — |
| Simplifier nudge (flagged) | 3 days | — |
| **Measure & decide** | **1 week** | **Data gate** |
| Adaptive engine (if green) | 2-3 weeks | Requires green gate |
| Foundation refactor | 3-4 weeks | Parallel, non-blocking |

---

## Skeptic's Challenge (Updated)
> "Victor wants 8 weeks for a moat. User Advocate wants 3 weeks for a feature salad. Simplifier wants 3 days for a nudge that *assumes* our data is clean. **Nobody has verified the data.** Let's spend 1 week auditing, 3 days shipping the nudge behind a flag, 1 week measuring. Then we *know* — instead of guessing."