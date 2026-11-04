# Round 2 — Pragmatist Critique & Revised Proposal

## Critique

### Chair — Strong vision, under-scoped execution
- **Wrong**: Asymmetric editorial grid "works" — it doesn't. RTL + asymmetric + responsive = 12 breakpoint permutations. You'll ship layout bugs or burn days fixing them.
- **Misses**: No component story. "No cards/borders/shadows" works for a landing page. It fails for tables, forms, modals, toasts, dropdowns — the actual product. You're designing a marketing page, not a SaaS interface.
- **Misses**: Accessibility. Nastaliq + screen readers = untested. WCAG AA contrast on charcoal/saffron/ivory needs verification (saffron on charcoal is ~3.2:1 — fails AA for text).
- **Misses**: Dynamic content subsetting. CMS-driven Persian content = unknown glyphs. Your pipeline assumes static content.

### Skeptic — Right risks, wrong process
- **Wrong**: 2-day spike *then* decide adds a week. We can de-risk *while* building. Parallelize: build the component library (which we need anyway) and measure on real pages simultaneously.
- **Wrong**: "Fall back to Plex-only" surrenders the differentiator. Nastaliq *is* the brand signal — solve the legibility/accessibility, don't delete it.
- **Right**: "No cards" is a marketing-page luxury. SaaS needs a component system. Build it first.
- **Right**: Real RTL bugs (Safari flex gap, `match-parent`, third-party numeral conversion) are unaddressed by both of us.
- **Right**: Subsetting pipeline must handle dynamic content — needs a glyph registry + fallback strategy.

## Revised Proposal: "Component-First Persian Luxury"

### What I'd Do (Revised)
1. **Week 1 (3 days): Component Foundation**
   - Build minimal RTL component set: Button, Input, Select, Table, Card, Modal, Toast, Tooltip — all on CSS Grid tokens, logical properties, saffron accent system.
   - Each component: RTL-tested, WCAG AA verified, `prefers-reduced-motion` native.
   - State colors: semantic tokens (success/warning/error/focus) derived from saffron/copper — not new hues.

2. **Week 1 (parallel, 2 days): Font & Performance Pipeline**
   - Subset Nastaliq (headline glyphs) + Plex Arabic (body glyphs) via `glyphhanger` + CI glyph registry.
   - Dynamic content strategy: runtime glyph check → missing glyphs → fallback to Plex Arabic + log for next build.
   - Preload + `font-display: swap` + size-adjust overrides for zero CLS.

3. **Week 2 (2 days): Pages + Measurement**
   - Compose landing + dashboard from components. Nastaliq headlines (min 32px, `font-size-adjust: 0.55`), Plex body.
   - Lighthouse CI in PR gate: LCP < 1.2s, CLS = 0, TBT < 150ms, a11y 100.
   - Real-device test matrix: iOS Safari, Chrome Android, Firefox Android, Safari macOS, Chrome Windows — all RTL.

4. **Accessibility Fix (non-negotiable)**
   - Nastaliq: `lang="fa"`, `dir="rtl"`, ARIA labels for decorative calligraphy, screen-reader-hidden duplicate in Plex Arabic.
   - Contrast: saffron darkened to `#D49610` (4.5:1 on charcoal) for text; `#E6A817` only for non-text accents (keylines, focus rings).

### Why This Works
- **De-risks in parallel**: Components prove the system; font pipeline proves subsetting; pages prove composition. No "spike then decide" waterfall.
- **SaaS-ready**: Component library *is* the design system. "No cards" becomes "Card component with 0 border, 0 shadow, saffron keyline" — consistent, reusable.
- **Nastaliq stays**: Accessibility solved via duplicate text + ARIA. Contrast fixed via token adjustment. Legibility enforced by 32px minimum token.
- **Dynamic content handled**: Glyph registry + fallback = production-safe subsetting.
- **RTL bugs caught**: Component-level RTL tests + 5-device matrix = confidence.

### Cost (Revised)
- **Dev time**: 7 days (3 components + 2 pipeline + 2 pages/measurement) — honest, not optimistic.
- **Design time**: 1 day (component tokens, state colors, motion specs).
- **Risk**: Medium. Three parallel tracks, but each is independently shippable. Worst case: Plex-only fallback at day 5 with working components.
- **Maintenance**: Glyph registry in CI (auto-updates on deploy). One accent token + 4 semantic state tokens. Zero JS layout deps.

### What I Need from Chair
- Approve component-first (not page-first) sequencing.
- Confirm saffron darkened to `#D49610` for text — luxury signal preserved, AA passed.

### What I Need from Skeptic
- Accept parallel de-risking over sequential spike.
- Component library *is* the spike — we measure on real components, not throwaway prototypes.