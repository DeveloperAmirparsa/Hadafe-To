# Victor Proposal — Round 1

## The Next Big Idea: **AI-Powered Adaptive Study Companion**

### What I'd Build
An intelligent, always-on study agent that lives inside the app — not just a chatbot, but a **proactive coach** that:
- **Generates micro-plans** nightly based on today's performance, weak spots, and the Konkur calendar
- **Intervenes in real-time** during study sessions: "You've drifted — 3 min break?" or "Switch to Math, your Physics retention dropped 18%"
- **Predicts burnout** 3-5 days out using streak, sleep proxy (login times), focus-point velocity, and test scores
- **Negotiates with the Counselor view** — drafts the weekly plan, counselor approves/edits, student sees only their daily slice

### Why This Wins
| Dimension | Current State | With AI Companion |
|-----------|---------------|-------------------|
| **Planning burden** | Student/counselor manually builds weekly sheets | Nightly auto-draft → 90% less counselor time |
| **Adaptation** | Static weekly plan | Reacts to every session report, habit log, test result |
| **Retention** | Streaks + FP only | Predictive nudges *before* dropout (churn ↓ 30-40%) |
| **Differentiation** | Great gamified tracker | **Only Konkour app with a true AI coach** — defensible moat |

### What It Costs
- **Engineering**: 2 senior devs × 8 weeks (core loop: planner → executor → reflector → planner)
- **LLM spend**: ~$0.02/student/day at scale (GPT-4o-mini class, structured outputs, cached prompts)
- **Infra**: Add pgvector for embedding-based weak-spot retrieval; WebSocket for live nudges
- **Risk**: Hallucinated study advice → mitigate with **deterministic guardrails** (curriculum graph, max hours/day, mandatory breaks) + counselor veto

### First Slice (Week 1-2)
1. **Nightly micro-plan generator** — deterministic algorithm first (rule-based), LLM only for natural-language summary
2. **In-session nudge API** — WebSocket endpoint, triggered by timer heartbeats + focus-point delta
3. **Counselor "Review & Approve" screen** — diff view of AI draft vs. current plan

### Victor's Stance
We're not building a *better planner*. We're building the **study partner every Konkour student wishes they had**. The gamification (FP, streaks, tournaments) is the hook; the AI coach is the retention engine. Ship the coach, own the category.