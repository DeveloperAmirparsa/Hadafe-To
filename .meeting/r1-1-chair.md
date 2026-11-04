# Round 1 — Chair Proposal

## The Next Developing Idea: AI-Powered Adaptive Study Companion

### What I'd Do
Build an **AI-driven adaptive study companion** that:
- Learns each student's weak/strong topics from their study patterns, quiz results, and focus sessions
- Dynamically adjusts the daily plan (already in `DailyPlanView.tsx`) to prioritize high-impact review
- Generates micro-quizzes on-the-fly using `@google/genai` (already in deps) targeting knowledge gaps
- Provides a "Study Coach" chat interface in the sidebar for instant doubt-clearing and motivation

### Why
- **Differentiation**: Konkour apps are crowded; adaptive AI is the moat
- **Retention**: Personalized paths keep students engaged longer (LTV ↑)
- **Data flywheel**: More usage → better recommendations → more usage
- **Leverages existing stack**: React + Electron + Express + GenAI already wired

### What It Costs
| Item | Estimate |
|------|----------|
| Backend: adaptive engine + quiz gen (Node/TS) | 2–3 weeks |
| Frontend: Coach chat + plan diff UI | 1–2 weeks |
| GenAI token budget (Gemini Flash) | ~$200–500/mo at 1k DAU |
| Prompt engineering / eval harness | 1 week |
| **Total** | **4–6 weeks, ~$1–2k/mo running** |

### Success Metrics
- **Week 4**: 30% of active users try Coach chat at least once
- **Week 8**: 15% lift in session completion rate vs. control
- **Week 12**: 20% reduction in "stuck" topics per diagnostic dashboard

### Risks & Mitigations
- **Hallucinated quiz items** → human-review pipeline for first 2 weeks, then automated eval
- **Token cost spike** → per-user daily cap, cache frequent queries
- **Privacy** → all study data stays on-device; only anonymized patterns hit API

### Decision Framework
If the table agrees, we proceed to spec (Round 2). If not, we pivot to the next strongest idea from the room.