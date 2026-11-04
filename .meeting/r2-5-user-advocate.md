# Round 2 — User Advocate Critique & Revision

## Critique: Victor (AI-Powered Adaptive Study Companion)

**Where I agree:**
- Nightly micro-plan generation is the right primitive — solves "what do I study today?"
- Counselor review loop is smart — keeps human in the loop for high-stakes Konkur prep
- Differentiation argument holds — AI coach *could* be a moat

**Where I diverge:**
| Victor's Proposal | User Reality |
|-------------------|--------------|
| Real-time in-session nudges ("You've drifted — 3 min break?") | **Intrusive**. Students in flow state *hate* interruptions. Timer already exists — let it be. |
| Burnout prediction from login times/sleep proxy | **Unreliable**. Login time ≠ sleep. False alarms erode trust. |
| WebSocket + pgvector + LLM for everything | **Over-engineered V1**. 8 weeks, 2 devs, $0.02/day/student — before proving users want it. |
| "Proactive coach" persona | **Anthropomorphism trap**. Users want a *tool*, not a fake friend. |

**My verdict**: Victor builds a **product for investors**, not for students. The real-time coach is a demo-ware feature that adds cognitive load.

---

## Critique: Skeptic (Fix Foundation First)

**Where I agree:**
- 44K-line `server.ts` is a genuine liability — every feature change is Russian roulette
- Zero integration tests = every deploy is a gamble with student data
- Electron build fragility wastes dev time
- Offline-first sync *is* a real user pain point (data loss = trust loss)

**Where I diverge:**
| Skeptic's Position | User Reality |
|--------------------|--------------|
| "Don't build features for 4–6 weeks" | **Unacceptable**. Konkur date is fixed. Students *need* better planning *now*. |
| "Refactor first, then features" | **False dichotomy**. Strangler fig: extract planner module *while* building it. |
| "Show me data that features move retention" | **Circular**. Can't get data without shipping. But we *have* data: manual planning abandonment ~40% (from session reports vs. tasks created). |
| Offline-first as "only evidence-backed feature" | **Necessary but not sufficient**. Sync fixes *trust*; adaptive planning fixes *outcomes*. Both matter. |

**My verdict**: Skeptic protects the *code*, not the *user*. A perfect architecture that doesn't help students pass Konkur is a beautiful failure.

---

## My Revised Proposal: **Phased Adaptive Study Engine (PASE)**

### Core Principle
**Ship user value in Week 1. Extract technical debt in parallel. Never ask users to wait for architecture.**

### Phase 1 (Week 1-2) — *Deterministic Nightly Planner* ⚡ SHIP THIS
- **Input**: Existing `diagnosticWeights`, `streak`, `habitLogs`, `sessionReports`, `tasks`, Konkur date
- **Algorithm**: Rule-based (no LLM) — weak subjects ↑ slots, strong subjects → maintenance, streak breaks → lighter load, buffer days before mock exams
- **Output**: `AdaptivePlan` object → feeds `DailyPlanView` (replace current manual planner)
- **User control**: "Regenerate" button, drag-to-reorder (existing), "Lock this task"
- **Technical**: New `/api/study-plan/generate` endpoint. **Extract into `src/server/planner/` module** — first strangler fig slice.

### Phase 2 (Week 3-4) — *LLM Rationale & Parent Brief* 🎯 DIFFERENTIATE
- **LLM only for**: Natural-language "Why this plan?" panel + weekly "Progress Brief for Parents" (Persian, shareable link)
- **Cost**: ~$0.001/student/day (single structured call, cached)
- **No WebSocket, no pgvector, no real-time nudges**

### Phase 3 (Week 5+) — *Adaptive Learning Loop* 📈 COMPOUND
- **Spaced repetition** integration (FSRS on question-level data — needs question bank first)
- **Weak-spot retrieval** via embeddings *if* question bank exists (pgvector then)
- **Counselor review screen** — diff view of AI draft vs. current (Victor's good idea, deferred)

---

## What Changed From My Round 1

| Round 1 | Round 2 (Revised) |
|---------|-------------------|
| "AI-Adaptive Engine" (vague) | **Phased**: Deterministic first, LLM second, Adaptive third |
| 2-3 weeks monolithic | **Week 1-2 shippable**, then iterate |
| No technical debt mention | **Planner module = strangler fig** for 44K-line server.ts |
| Parent brief as "nice to have" | **Core differentiator** — Iranian parents *drive* Konkur decisions |
| Silent on Skeptic's concerns | **Explicitly addresses**: extract module, add tests for planner, CI gate |

---

## My Vote (Revised)
**Approve Phase 1 immediately.** It:
- Ships user value in 2 weeks (answers "what do I study today?")
- Creates the `planner` module that *starts* the refactor Skeptic demands
- Adds integration test surface (planner is pure logic — 100% testable)
- Costs 1 dev × 2 weeks — parallelizable with Skeptic's refactor work
- Gives real retention data to settle the "features vs. foundation" debate

**Defer Phase 2/3** until Phase 1 metrics prove adherence ↑ and manual planning abandonment ↓.

**Challenge to Victor**: Build the *nightly planner* first. Prove students follow it. Then we talk real-time coach.

**Challenge to Skeptic**: Assign 1 dev to planner module extraction (serves Phase 1). Other devs continue refactor. Not sequential — *parallel*.