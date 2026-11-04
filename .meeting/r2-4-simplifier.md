# Round 2 — Simplifier Critique & Revised Proposal

## Critiques of Round 1 Proposals

### Chair — "AI-Powered Adaptive Study Companion"
**Wrong**: Treats "Study Coach chat" as core feature. Chat is a *distraction* — students in Konkur prep don't want to *talk* to an AI, they want to *study*. Every tap in chat is a tap not studying.
**Misses**: The 44K-line server.ts (Skeptic's point). Adding GenAI routes to a monolith without tests is how you get production hallucinations that corrupt study plans.

### Victor — "Proactive AI Coach with Real-Time Nudges"
**Wrong**: WebSocket + pgvector + burnout prediction = **over-engineering before product-market fit**. "Negotiates with Counselor view" assumes counselors exist and have time — they don't.
**Misses**: The *actual* user behavior: students open app → see plan → start OR close app. Real-time nudges during study are intrusive; they break flow. Victor's first slice (Week 1-2) is 3 features — that's not a slice, that's a phase.

### User Advocate — "AI-Adaptive Personalized Study Engine"
**Wrong**: "Plan adherence 60% → 80%" is a **made-up number**. No baseline cited. "Energy-aware load balancing" = more AI surface area, more ways to be wrong.
**Misses**: The *simplest* adaptive signal already exists: `diagnosticWeights` + overdue tasks. No GenAI needed. Also misses Skeptic's warning — building on 44K-line spaghetti without tests is reckless.

### Skeptic — "Fix Foundation First"
**Right on the problem** (44K-line server.ts, zero tests, fragile sync).
**Wrong on the prescription**: "4-6 weeks refactor before *any* feature" is a **death spiral**. Students don't care about module boundaries. They care about "what do I study today?" Refactor *while* shipping the smallest possible user-facing value — not instead of.

---

## Revised Proposal: **Smart Daily Nudge + Surgical Refactor (Parallel)**

### What I'd Do (Revised)
**Two tracks, one dev, 2 weeks total:**

| Track | Scope | Days |
|-------|-------|------|
| **A. Smart Daily Nudge** (user-facing) | 1 new component (`NextTaskCard`), deterministic picker from existing `tasks` + `diagnosticWeights` + `habitLogs`, slots into `DailyPlanView` | 3 |
| **B. Surgical Refactor** (foundation) | Extract *only* the study-plan logic from `server.ts` into a tested module (`src/domain/study-plan/`), add 5 integration tests for plan generation | 7 |

**No GenAI. No cron. No WebSocket. No pgvector. No chat.**

### Why This Revision
- **Chair/Victor/User Advocate** all want "adaptive" — but none define *what adapts*. My Track A ships the *simplest adaptive signal* (weakest subject + overdue) in 3 days. Measure tap-through. *Then* decide if AI adds marginal value.
- **Skeptic** is right that 44K lines is a liability — but a *full* refactor blocks value. Track B extracts *only the domain we're touching* (study plans), adds tests *there*, and leaves the rest alone. Incremental, not big-bang.
- **Parallel tracks** = no "refactor pause." User gets value Day 3. Codebase gets safety Day 10.

### What It Costs (Revised)
- **Total effort**: 2 weeks, 1 dev (vs. 4-8 weeks, 2-3 devs for AI proposals)
- **Backend**: ~200 lines extracted + 5 tests (vs. new endpoints, cron, pgvector)
- **Frontend**: ~200 lines TSX (vs. Coach chat, Plan Rationale, Counselor diff view)
- **Risk**: Near-zero — deterministic, testable, reversible, no external API deps

### Success Metrics (Revised — Measurable, Not Aspirational)
1. **Day 3**: `NextTaskCard` ships → tap-through rate measured
2. **Day 10**: Study-plan module has 5 passing integration tests → refactor verified
3. **Week 4**: If tap-through > 40% *and* session completion > 70% → *then* propose AI enhancement (with data)
4. **Week 4**: Defect rate on study-plan endpoints = 0 (thanks to Track B tests)

### My Vote (Revised)
**Do Track A + Track B in parallel. Stop debating AI.** The room is designing a Ferrari engine for a car with no wheels. Ship the wheels (one clear next task), fix the axle (study-plan module), *then* argue about the engine.

---

## Direct Responses to Each Role

| Role | You Said | I Say |
|------|----------|-------|
| Chair | "Adaptive AI is the moat" | Moat = *speed of learning loop*. Deterministic nudge in 3 days > AI plan in 4 weeks. |
| Victor | "Proactive coach owns category" | Category owned by *who helps students pass*. Nudge does that; chat doesn't. |
| User Advocate | "AI picks highest-impact tasks" | `diagnosticWeights` already does this. No LLM needed. Prove me wrong with data. |
| Skeptic | "Refactor first, features later" | Refactor *what you touch*. Extract study-plan module *while* shipping the nudge. |