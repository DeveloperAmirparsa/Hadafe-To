# Decision: The Next Developing Idea For Hadafe To

**Date**: 2026-11-04  
**Status**: Approved  
**Branch**: `office/meeting-the-next-developing-idea-for-the-bb84`

---

## The Decision

We will build a **Phased Adaptive Study Engine (PASE)** — a staged experiment that ships user value in Week 1, validates with data, and compounds toward an AI coach. This decision merges the strongest arguments from all four perspectives.

---

## Approved Plan: Three Phases, One Committed Experiment

| Phase | Scope | Owner | Time | Gate |
|-------|-------|-------|------|------|
| **1. Deterministic Nightly Planner** | Rule-based planner using existing `diagnosticWeights` + `tasks` + `habitLogs` + Konkur date. Feeds `DailyPlanView`. "Regenerate" + drag-to-reorder + lock. **Extract `planner` module from `server.ts`** (strangler fig). Add integration tests. | 1 backend + 1 frontend | 2 weeks | Plan adherence > baseline (measured) |
| **2. LLM Rationale + Parent Brief** | Single structured LLM call for "Why this plan?" panel + weekly Persian progress brief for parents (shareable link). Cached 24h. No real-time, no WebSocket, no pgvector. | 1 backend + 1 frontend | 2 weeks | Rationale helpfulness > 60% (in-app survey) |
| **3. Adaptive Learning Loop** | Spaced repetition (FSRS) on question-level data. Weak-spot embeddings *if* question bank exists. Counselor diff review. | Full team | 4-6 weeks | Retention ↑ 15% vs. Phase 1 baseline |

**Phase 1 is approved and committed. Phases 2-3 are conditional on Phase 1 data.**

---

## Why This Decision

### What We Learned from the Room

| Perspective | Core Truth We Adopted | What We Rejected |
|-------------|----------------------|------------------|
| **Victor** | Nightly micro-plan is the right primitive; coach = decision layer between student and views | Real-time WebSocket nudges, burnout prediction, pgvector, 8-week timeline |
| **Skeptic** | 44K-line `server.ts` is a liability; tests + observability are non-negotiable; data must be verified | "No features for 6 weeks" — we refactor *via* the planner module (strangler fig) |
| **Simplifier** | Deterministic rules using existing data ship fast, testable, reversible; client-side nudge = control | "No AI ever" — AI comes in Phase 2, only for rationale/briefs, not core logic |
| **User Advocate** | Parents drive Konkur decisions (Persian brief = differentiator); manual planning abandonment ~40% is our baseline | 5-feature bundle, buried override, vague "energy-aware" AI |

### The Synthesis

**The moat is not AI. The moat is the speed of our learning loop.**

- Phase 1 ships in **2 weeks** (not 8)
- Phase 1 **extracts the `planner` module** — the first strangler fig slice of the monolith
- Phase 1 **adds integration tests** on pure planner logic (100% testable)
- Phase 1 **measures real adherence** — the data Skeptic demanded
- Phase 2 adds **LLM only where it differentiates** (parent briefs, rationale) — not core planning
- Phase 3 compounds **only if data justifies it**

---

## Technical Commitments

### Phase 1 Deliverables (Week 1-2)
- [ ] `src/server/planner/` module extracted from `server.ts` with clean interface
- [ ] `POST /api/study-plan/generate` endpoint (deterministic, no LLM)
- [ ] 10+ integration tests for planner logic (coverage > 80%)
- [ ] `DailyPlanView` replaced with adaptive plan + "Regenerate" + drag-reorder + lock
- [ ] Anonymous event logging: `plan_generated`, `plan_regenerated`, `task_started`, `task_completed`, `plan_adhered`
- [ ] Feature flag: `adaptive_planner_v1` (default ON for 50% rollout)

### Non-Negotiables (Skeptic's Requirements)
- [ ] CI gate: planner tests must pass on every PR
- [ ] Observability: adherence dashboard in Grafana (or equivalent) by end of Week 2
- [ ] No new external dependencies in Phase 1

---

## Success Metrics & Decision Gates

| Metric | Phase 1 Target | Phase 2 Target | Phase 3 Target |
|--------|----------------|----------------|----------------|
| **Plan adherence rate** | > baseline + 15% | > baseline + 25% | > baseline + 35% |
| **Manual planning abandonment** | < 30% (from ~40%) | < 20% | < 15% |
| **Weak-subject diagnostic improvement** | — | +10% over 4 weeks | +20% over 8 weeks |
| **Parent brief share rate** | — | > 25% of active users | > 40% |
| **Defect rate on planner endpoints** | 0 | 0 | 0 |

**Gate**: If Phase 1 adherence lift < 10%, we **pause** and audit data pipeline (Skeptic's path). If ≥ 10%, we proceed to Phase 2.

---

## Resource Allocation

| Role | Phase 1 | Phase 2 | Phase 3 |
|------|---------|---------|---------|
| Backend | 1 dev (planner module + endpoint + tests) | 1 dev (LLM rationale + parent brief) | 2 devs (adaptive loop) |
| Frontend | 1 dev (DailyPlanView + events) | 1 dev (Rationale panel + brief UI) | 2 devs (spaced rep + counselor diff) |
| DevOps | CI gate + observability setup | — | pgvector if needed |

**Total Phase 1 cost**: 2 devs × 2 weeks = **4 dev-weeks**  
**Running cost**: $0 (no LLM in Phase 1)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| `diagnosticWeights` inaccurate | Phase 1 Week 1: data audit (Skeptic's demand) — if broken, fix before planner |
| Planner module extraction breaks server.ts | Strangler fig: new module calls old code internally; switch endpoint atomically behind flag |
| Students ignore adaptive plan | "Regenerate" + manual override + lock = agency preserved (Simplifier's point) |
| Phase 2 LLM cost spikes | Single structured call, cached 24h, capped at 2/user/day |
| Counselor workflow doesn't exist | Phase 3 counselor diff is *deferred* — only if counselors actually use the app |

---

## What We Explicitly Do NOT Build (Yet)

- ❌ Real-time WebSocket nudges during study sessions
- ❌ Burnout prediction from login/sleep proxies
- ❌ pgvector / embeddings for weak-spot retrieval
- ❌ "Study Coach" chat interface
- ❌ Spaced repetition (FSRS/SM-2)
- ❌ Full Counselor review screen

These are **Phase 3+** — only if data demands them.

---

## Next Steps

1. **Today**: Create GitHub issue "PASE Phase 1: Deterministic Nightly Planner" with task breakdown
2. **Day 1**: Backend dev starts `planner` module extraction; Frontend dev starts `DailyPlanView` adaptation
3. **Day 3**: Data audit complete — if `diagnosticWeights` broken, fix first
4. **Day 7**: Planner module + tests merged behind feature flag
5. **Day 10**: Adaptive plan live for 50% rollout
6. **Day 14**: Phase 1 gate review — metrics decide Phase 2

---

## Sign-Off

| Role | Name | Approve | Notes |
|------|------|---------|-------|
| **Chair** | — | ✅ | Decision recorded |
| Victor | — | | Proactive coach deferred to Phase 3+ |
| Skeptic | — | | Refactor via strangler fig accepted; observability non-negotiable |
| Simplifier | — | | Deterministic Phase 1 accepted; AI deferred with gate |
| User Advocate | — | | Phased approach accepted; parent brief = Phase 2 differentiator |

---

**This decision is binding. Phase 1 starts immediately. Phase 2+ require explicit re-approval at gate review.**