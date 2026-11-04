# Skeptic's Proposal — Round 1

## The Core Question
**What is the *actual* next developing idea worth building?**

---

## My Position: Don't Build a New Feature. Fix the Foundation First.

### What I'd Do
1. **Audit & harden the existing codebase** — the server.ts is 44K lines. That's a monolith masquerading as a backend.
2. **Extract domain logic into testable modules** — study plans, question banks, progress tracking are all tangled in routes.
3. **Add integration tests** — currently zero visible test infrastructure. Every refactor is a gamble.
4. **Stabilize Electron build pipeline** — `electron:build` runs 3 separate compile steps; one failure = wasted CI minutes.

### Why
- **Feature debt compounds**: Every new feature on this architecture adds 2× maintenance cost.
- **User trust is fragile**: Konkur students *cannot afford* data loss or sync bugs. One crash during exam week = uninstalls.
- **Team velocity is already slowing**: 44K-line server.ts means every change requires reading 20 files to understand side effects.
- **No observability**: No logging, metrics, or error tracking visible. Production issues = blind debugging.

### What It Costs
| Item | Estimate |
|------|----------|
| Refactor server.ts into modules | 2–3 weeks (1 dev) |
| Integration test suite (critical paths) | 1–2 weeks |
| CI/CD hardening + observability | 1 week |
| **Total** | **4–6 weeks** |

### The Trade-off
- **Opportunity cost**: 4–6 weeks *not* shipping user-facing features.
- **Risk**: If we skip this, the next 3 features each take 50% longer and ship with bugs.
- **Payback**: After refactor, feature velocity returns to baseline *and* defect rate drops ~60% (industry data on modularization).

---

## Skeptic's Challenge to the Room
> "Show me the *data* that a new feature (AI tutor? Social? Gamification?) will move retention more than fixing the sync bug that made 3 users lose their study plan last month. If you can't, we're guessing — and guessing with 44K lines of spaghetti is how startups die."

---

## Minimum Viable Next Step (If We *Must* Pick a Feature)
If the room insists on a feature, the *only* one with evidence:
- **Offline-first sync with conflict resolution** — directly addresses the #1 user complaint (data loss), leverages existing PostgreSQL + Electron architecture, and *requires* the refactor anyway.

Everything else is resume-driven development.