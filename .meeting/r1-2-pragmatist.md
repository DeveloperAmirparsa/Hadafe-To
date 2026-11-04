# Round 1 — Pragmatist Proposal

## Design Direction: "Shippable Luxury" — Pragmatic Persian-First

### What I'd Do
- **Palette**: Chair's palette is solid. Add: semantic color tokens (success/warning/error) in muted tones that work on charcoal. One accent is right — but expose it as CSS custom property for theming.
- **Typography**: Noto Nastaliq is 1.2MB full. **Subset to 35KB** (headline glyphs only) via `glyphhanger` in CI. Plex Arabic + Plex Sans: subset to Latin + Arabic blocks (~45KB total). Preload both. Fallback stack: `system-ui, "Segoe UI", Tahoma, Arial` — no flash of invisible text.
- **Layout**: CSS Grid + `writing-mode: horizontal-tb` + `direction: rtl`. **No asymmetric editorial grid** — it breaks on mobile, creates QA debt. Use: 12-col fluid grid, 24px gutter, max-width 1200px. Hero = centered headline, keyline, one CTA. Components stack predictably.
- **Motion**: Chair's stroke animation = 1.2s JS or complex SVG. **Replace with**: CSS `::before` keyline draw (0.6s), headline `opacity` + `translateY` (0.4s). Zero JS, respects `prefers-reduced-motion` natively. Total motion CSS: 200 bytes.
- **RTL/FA Optimization**: Logical properties — yes. Add: `text-orientation: mixed` for Latin-in-Persian runs. Persian numerals via `Intl.NumberFormat('fa-IR')` utility (tree-shakeable, 1KB). Line-height: 1.7 universal — simpler, works for both fonts.

### Why
- **Shippable in 3 days, not 5**: Grid layout = 1 day (vs 3 for asymmetric). Font subsetting pipeline = half day (standard tooling). RTL QA = 1 day (test matrix: Chrome/Firefox/Safari × mobile/desktop × RTL/LTR).
- **Maintainable**: No Nastaliq at small sizes (min 32px enforced by design token). No stylistic sets — use standard OpenType features (`calt`, `liga`) only. One accent token = one-line rebrand.
- **Performance**: 60KB gzipped target is real. Subset fonts + CSS Grid + no JS layout = 0 layout shift, LCP < 1s on 3G. Bundle stays < 50KB JS (just hydration + numeral util).
- **Risk mitigation**: Nastaliq fallback = Plex Arabic at 24px (tested readable). `font-variant-alternates` not used — avoids 8% browser gap. Safari 15.4+ supports all logical properties.

### Cost
- **Design time**: 0.5 days (token system only — grid is standard)
- **Dev time**: 2.5 days (Grid layout 1d, font pipeline 0.5d, RTL QA 1d)
- **Ongoing**: Font subsetting in CI (5 min/build). One accent token. No motion library.
- **Trade-off accepted**: Less "editorial flair" for 40% less dev time, zero layout bugs on mobile, simpler handoff.