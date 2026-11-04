# Round 1 — Chair Proposal

## Design Direction: "Quiet Luxury" Persian-First Interface

### What I'd Do
- **Palette**: Deep charcoal base (#0D0D0D), warm ivory text (#F5F0E8), single accent — saffron gold (#E6A817) for primary actions, muted copper (#B87333) for hover. No gradients, no decorative shadows.
- **Typography**: **Noto Nastaliq Urdu** for Persian headlines (calligraphic elegance, luxury feel), **IBM Plex Sans Arabic** for Persian body (legible, modern), **IBM Plex Sans** for Latin. Single weight per role — no bold/italic mixing.
- **Layout**: Asymmetric editorial grid. Hero = single Persian headline in Nastaliq, generous negative space, one saffron keyline. Content flows in staggered columns (60/40 split) — left for primary, right for secondary. No cards, no rounded corners, no borders.
- **Motion**: One orchestrated entrance — headline writes itself (stroke animation) over 1.2s, then keyline draws. Everything else appears instantly. Reduced-motion respected.
- **RTL/FA Optimization**: Logical properties throughout (`inline-start`/`inline-end`), `dir="rtl"` on `<html>`, Persian numerals (`toLocaleString('fa-IR')`), line-height 1.8 for Nastaliq, 1.6 for body. Font subsetting: only needed glyphs (~40KB each).

### Why
- **Minimal**: Removes every default SaaS pattern (cards, shadows, gradients, all-caps labels, middle-dot metas). What remains is content and one accent.
- **Luxury**: Nastaliq calligraphy *is* the luxury signal — culturally authentic, not pasted-on. Saffron gold references Persian heritage without cliché. Asymmetric grid feels editorial, not templated.
- **Optimized**: Subset fonts, no JS framework for layout (CSS Grid only), single paint on load, ~60KB total CSS+fonts gzipped. LCP < 1.2s on 3G.
- **Farsi-first**: Not "supports RTL" — designed *in* RTL. Nastaliq for headlines honors the script's beauty; Plex Arabic for body honors readability.

### Cost
- **Design time**: 2 days (token system, grid, motion spec)
- **Dev time**: 3 days (CSS Grid layout, font subsetting pipeline, RTL QA)
- **Risk**: Nastaliq legibility at small sizes — mitigate with minimum 32px headline size, fallback to Plex Arabic. Browser support for `font-variant-alternates` (Nastaliq stylistic sets) is ~92% — graceful degradation tested.
- **Maintenance**: Zero JS dependencies for layout. Font subsetting script in build pipeline. One accent color to change for rebrand.