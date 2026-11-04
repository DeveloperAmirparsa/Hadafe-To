# Round 1 — Skeptic Proposal

## Design Direction: "Prove It First" — De-Risk Before Committing

### What I'd Do
- **Scope down to a spike**: Build *one* critical page (landing or dashboard) as a throwaway prototype in 2 days. Validate Nastaliq legibility, RTL grid behavior, font loading, and actual LCP on real devices before greenlighting the full system.
- **Question the "luxury" claim**: Nastaliq at 32px+ is a headline-only font. Body text at 16–18px in Nastaliq is unreadable — so "Persian-first" actually means "headlines in Nastaliq, everything else in Plex." That's two fonts, not a unified system. Where's the luxury in inconsistency?
- **Demand real performance data**: "60KB gzipped" assumes perfect subsetting. Nastaliq has 1,000+ glyphs; Plex Arabic ~800. Subsetting to "only needed glyphs" requires knowing *all* content upfront — dynamic content breaks this. Show me the subsetting pipeline working on real CMS data first.
- **Reject the zero-JS layout dogma**: CSS Grid is great, but asymmetric editorial grids with staggered columns *and* RTL flip *and* responsive breakpoints *and* Nastaliq line-height quirks = fragile layout. One JS layout helper (2KB) prevents 20KB of defensive CSS hacks.

### Why
- **Minimal ≠ incomplete**: Removing cards, borders, shadows, gradients leaves *no visual hierarchy affordances* for complex SaaS UI (tables, forms, modals, toasts). The proposal only covers marketing-page layout. What happens when users need a data table? A settings panel? A confirmation dialog? "No cards" becomes "custom everything" — that's maximal effort, not minimal.
- **Luxury ≠ calligraphy**: Nastaliq is culturally resonant but *excludes* users who can't read it fluently (younger generations, diaspora, accessibility tools). Screen readers handle Nastaliq poorly. "Luxury" that fails WCAG AA is a lawsuit waiting to happen.
- **Optimized ≂ unmeasured**: No Lighthouse CI, no RUM, no 3G throttle test in CI. "LCP < 1.2s on 3G" is a guess until measured. Font subsetting adds build complexity — if it breaks, the whole site breaks (FOIT/FOUT).
- **Farsi-first ≠ RTL-only**: Logical properties are baseline, not innovation. The real RTL problems: flexbox gap reversal bugs in Safari, `text-align: start` vs `match-parent` inconsistencies, numeral conversion in third-party components (date pickers, charts). None are addressed.

### Cost (Realistic)
- **Spike**: 2 days (prototype one page, measure, decide)
- **Full system if spike passes**: 5–7 days (not 3) — defensive RTL CSS, subsetting pipeline hardening, component library for "no cards" UI patterns, a11y audit for Nastaliq
- **Risk**: High. Nastaliq legibility + RTL layout fragility + subsetting pipeline = three independent failure modes. Any one sinks the timeline.
- **Maintenance**: Font subsetting script = new build dependency. Every content change risks missing glyphs. "One accent color" ignores state colors (error, success, warning, focus) — those need a system too.

### Counter-Proposal
1. **Week 1**: Spike landing page with Nastaliq headline + Plex body. Measure LCP, CLS, a11y, RTL breakage on 5 devices/browsers.
2. **Gate**: If spike passes (LCP < 1.5s, zero CLS, WCAG AA), proceed. If not, fall back to Plex-only with saffron accent — still distinctive, half the risk.
3. **Component-first**: Build a minimal RTL component set (Button, Input, Card, Table, Modal, Toast) *before* pages. "No cards" is a marketing-page luxury; SaaS needs cards.