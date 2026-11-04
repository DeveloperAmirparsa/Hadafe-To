# Round 2 — Chair Critique & Revised Proposal

## Critiques of Round 1 Proposals

### Victor — **Aligns with my vision, but over-scopes**
- ✅ Same core thesis: AI coach as retention engine, not just planner
- ❌ **8 weeks / 2 seniors** is too long for first slice; "core loop" tries to do everything at once
- ❌ WebSocket + pgvector + counselor veto = infrastructure creep before proving value
- ✅ **Nightly micro-plan generator (deterministic first)** is the right Week 1-2 slice — steal this

### Skeptic — **Right problem, wrong sequencing**
- ✅ 44K-line `server.ts` is a real liability; every feature compounds the debt
- ❌ **"Fix foundation first" is a false choice** — we can do *both* with a thin vertical slice
- ❌ Offline-first sync is necessary but not *differentiating*; it's table stakes, not a moat
- ✅ **Integration tests + observability** must be non-negotiable for whatever we ship

### Simplifier — **Best execution risk profile, but risks irrelevance**
- ✅ 3-5 days, 1 dev, zero deps — ships fastest, learns fastest
- ✅ Deterministic rules using existing `diagnosticWeights` + `habitLogs` is smart reuse
- ❌ **No AI = no moat** — competitors can copy a rule-based "next task card" in a sprint
- ❌ If tap-through is low, we learn nothing about *adaptive* value (the real hypothesis)
- ✅ **Use this as the *control* in an A/B test** against the AI slice

### User Advocate — **Closest to mine, but over-promises on v1**
- ✅ Same pain points, same data sources, same GenAI integration
- ❌ "Nightly cron + prompt engineering + FSRS/SM-2 + parent briefs" = 5 features in one
- ❌ **Manual override buried** — Simplifier is right: friction kills adherence
- ✅ **Plan adherence + weak-subject improvement** are the right metrics

---

## My Revised Proposal: **Thin Vertical Slice → Measure → Decide**

### The Strategy
**Don't choose one proposal. Sequence them as a staged experiment.**

| Phase | What | Who | Time | Decision Gate |
|-------|------|-----|------|---------------|
| **0** | **Stabilize CI + add integration test harness** (Skeptic's non-negotiable) | 1 backend | 1 week | Green CI, >50% critical-path coverage |
| **1** | **Simplifier's "Next Task Card" as control** — deterministic, client-side, lives in `DailyPlanView` | 1 frontend | 3 days | Tap-through >40%, completion >70% |
| **2** | **Victor's "Nightly Micro-Plan Generator" as treatment** — deterministic rules + LLM summary only, no chat, no WebSocket | 1 backend + 1 frontend | 2 weeks | Plan adherence lift >15% vs. control |
| **3** | **If Phase 2 wins** → Invest in AI coach (quiz gen, chat, burnout prediction) | Full team | 4-6 weeks | Retention ↑ 30% |

### What This Costs (Revised)
| Item | Estimate |
|------|----------|
| Phase 0 (tests + CI) | 1 week |
| Phase 1 (control) | 3 days |
| Phase 2 (treatment) | 2 weeks |
| **Total to decision** | **~3.5 weeks** |
| Full AI coach (Phase 3) | +4-6 weeks *only if Phase 2 wins* |

### Why This Wins
- **De-risks the biggest unknown**: Does *any* adaptive logic beat manual planning?
- **Respects Skeptic's constraint**: Tests first, no new infra until Phase 2 proves out
- **Respects Simplifier's constraint**: Control is trivial to build, near-zero risk
- **Respects Victor/User Advocate**: Treatment uses same data, same GenAI, but *scoped*
- **Decision at 3.5 weeks**, not 8 — pivot/persevere with data, not opinions

### My Vote
**Approve Phases 0-2 as a single committed experiment.** Phase 3 is a separate decision after Phase 2 data lands.