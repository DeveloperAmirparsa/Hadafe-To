# Decision: New Frontend Design — Minimal, Luxury, Persian-Optimized

**Date**: 2026-11-04  
**Participants**: Chair, Pragmatist, Skeptic  
**Status**: Approved for implementation

---

## What Was Decided

We will build a **Persian-first, minimal luxury design system** with the following specifications:

### 1. Typography (Locked)
| Role | Font | Size | Weight | Notes |
|------|------|------|--------|-------|
| Display / H1 | Noto Nastaliq Urdu (subset) | `clamp(2.5rem, 6vw, 4.5rem)` | 400 | Min 32px, `font-size-adjust: 0.55` |
| H2 | IBM Plex Sans Arabic | `clamp(1.5rem, 3vw, 2.25rem)` | 600 | |
| Body | IBM Plex Sans Arabic | `1rem / 1.7` | 400 | |
| Small / UI | IBM Plex Sans Arabic | `0.875rem / 1.6` | 400 | |
| Latin fallback | IBM Plex Sans | — | — | Subset together |

**Nastaliq accessibility**: Headlines render visually in Nastaliq; screen readers receive duplicate text in Plex Arabic via `aria-hidden`/`sr-only` pattern. This preserves the luxury signal for sighted users while meeting WCAG AA.

### 2. Color System (Locked)
```css
:root {
  --color-base: #0D0D0D;           /* Background */
  --color-text: #F5F0E8;           /* Primary text (14.8:1) */
  --color-accent: #E6A817;         /* Saffron — keylines, focus rings, non-text accents */
  --color-accent-text: #D49610;    /* Darkened saffron — text on base (4.5:1) */
  --color-accent-hover: #B87333;   /* Copper — hover states */
  --color-success: #2D7D46;        /* Muted on charcoal */
  --color-warning: #C47D1A;
  --color-error: #B83D3D;
  --color-focus: #E6A817;          /* Matches accent */
}
```
**Rationale**: Single hue family (saffron→copper) for brand coherence. Darkened token for text passes AA; bright token reserved for decorative accents. Semantic tokens derived, not invented.

### 3. Layout Systems (Two-Track)
| Surface | Grid | Breakpoints | Rationale |
|---------|------|-------------|-----------|
| Marketing pages (landing, features, pricing) | **Asymmetric editorial** — 60/40 split at ≥768px, single column mobile | 1 media query | Differentiator. "Quiet luxury" = editorial asymmetry. One query is not fragile. |
| App / Dashboard / Settings | **12-col fluid** — 24px gutter, max-width 1200px | 6 standard | SaaS density needs predictable columns. Same tokens, different composition. |

**No cards, no rounded corners, no shadows** — keyline borders only (`1px solid var(--color-accent)` primary, `rgba(245,240,232,0.2)` secondary).

### 4. Motion (Locked)
- **Page entrance**: `::before` keyline draw (0.6s, `cubic-bezier(0.4,0,0.2,1)`) + headline `opacity` + `translateY(-8px)` (0.4s). Zero JS.
- **Interactions**: 150ms transition on `color`, `border-color`, `transform`.
- **Reduced motion**: `prefers-reduced-motion` → `0.01ms` globally.

### 5. RTL / Persian Hardening (Locked)
- Logical properties everywhere (`margin-inline`, `padding-inline`, `border-inline`)
- `dir="rtl"` on `<html>`, `lang="fa"`
- Persian numerals: `Intl.NumberFormat('fa-IR')` utility (tree-shaken, 1KB)
- `text-orientation: mixed` with Safari fallback (CSS `@supports` guard)
- Nastaliq `line-height: 1.85` (diacritic clearance), Plex Arabic `1.7`
- Safari flexbox gap fix: progressive enhancement via `margin-inline-end`

### 6. Font Pipeline (Locked)
```yaml
# CI-integrated (glyphhanger)
fonts:
  - family: "Noto Nastaliq Urdu"
    subset: "headline glyphs from content manifest"
    output: "woff2"
    target: 35KB
  - family: "IBM Plex Sans Arabic"
    subset: "arabic + latin blocks"
    output: "woff2"
    target: 45KB
preload: both
font-display: swap
size-adjust: calculated per font (zero CLS)
fallback: system-ui stack
```
**Build gate**: Fail if glyph coverage < 99% on staged content manifest. Dynamic content → runtime missing-glyph detection → fallback to Plex + log for next build.

### 7. Component Library (Locked Scope)
Build **after** marketing page validates the system (Day 3 gate), not before. Minimal set:
`Button`, `Input`, `Select`, `Table`, `Modal`, `Toast`, `Card`, `Avatar`, `Badge`, `Tooltip`

Each component: RTL-tested, WCAG AA verified, dark/light mode ready (charcoal base = dark mode; light mode = inverted tokens), Nastaliq-safe (headline only, 32px min).

### 8. Implementation Sequence (Locked)

| Phase | Days | Deliverable | Gate |
|-------|------|-------------|------|
| 1. Design tokens + asymmetric grid spec | 1 | Token CSS, grid CSS, motion CSS | — |
| 2. Font pipeline (glyphhanger + CI gate) | 1 | Subset fonts, preload, build gate | — |
| 3. Marketing page (landing) | 1 | Hero, features, footer in asymmetric grid | **Day 3 Gate** |
| 4. Day 3 Gate — must pass ALL: | | | |
| | | LCP < 1.2s (3G throttle) | |
| | | CLS = 0 | |
| | | WCAG AA (contrast, spacing, screen reader) | |
| | | Zero layout shift on RTL flip | |
| | | Nastaliq readable at 32px on iOS Safari + Chrome Android | |
| 5a. If PASS → Component library + App layout | 5 | 10 components, 12-col grid, dashboard page | — |
| 5b. If FAIL → Fallback build | 3 | Plex-only headlines, saffron accent, same components | — |
| **Total (pass path)** | **8 days** | | |
| **Total (fail path)** | **6 days** | | |

---

## Options That Lost (and Why)

| Option | Proponent | Why It Lost |
|--------|-----------|-------------|
| **Standard 12-col grid for everything** | Pragmatist (R1), Skeptic (R1/R2) | Removes the only visual differentiator. Asymmetric grid is one media query; "editorial" is the luxury signal. Mobile stacks to single column — no reading-rhythm break. |
| **2-day throwaway spike before any build** | Skeptic (R1/R2) | Delays decision by 2 days for data we can get in Day 3 gate on *real* marketing page. The marketing page *is* the spike — built to stay, not throw away. |
| **Component library before any page** | Pragmatist (R2), Skeptic (R2) | Components designed in a vacuum drift from page needs. Build components *from* the validated marketing page — they'll be right the first time. |
| **Plex-only fallback as primary direction** | Skeptic (fallback) | Surrenders the cultural luxury signal. Nastaliq + accessibility fix (ARIA duplicate + darkened token) solves the a11y risk; deleting it is premature. |
| **Zero-JS dogma (no layout helper)** | Chair (R1), Pragmatist (R1) | Relaxed: 2KB layout helper permitted *if* defensive CSS exceeds 20KB. Default to CSS Grid; escape hatch exists. |
| **Saffron `#E6A817` for all text** | Chair (R1/R2) | Fails WCAG AA (3.2:1 on charcoal). Pragmatist's darkened `#D49610` for text, bright for accents — accepted. |
| **Universal line-height 1.7** | Pragmatist (R1) | Nastaliq needs 1.85 for diacritics; Plex reads at 1.6. Per-font line-heights locked. |

---

## What's Still Open

1. **Light mode token set** — Charcoal base implies dark-mode-only. If light mode is required, invert token map (ivory base, charcoal text, saffron accent). Decision needed before Phase 5.

2. **Third-party component integration** — Charts, date pickers, rich text editors won't use our numeral utility or tokens. Strategy: wrapper components? CSS-in-JS override? Accept inconsistency? Owner: Frontend lead.

3. **Dynamic content glyph registry** — CMS headline changes may introduce missing glyphs. Pipeline logs gaps; but who triages? Automated PR to add glyphs? Manual? Owner: DevOps + Frontend.

4. **Nastaliq `font-variant-alternates` usage** — Stylistic sets (swashes, alternates) could enhance headlines. 92% global support, ~80% in Iran. Optional enhancement — not in critical path.

5. **Animation library for complex transitions** — Page entrance is CSS-only. If future needs exceed CSS (staggered reveals, scroll-linked), evaluate Motion One (3KB) vs Framer Motion (18KB). Not needed now.

6. **Design token format** — CSS custom properties (current) vs JSON + Style Dictionary for multi-platform (React Native, docs). Decide if design tokens leave web.

---

## Sign-Off

**Chair**: Approved. The asymmetric grid stays as the differentiator; the Day 3 gate de-risks honestly; components follow validated design; Nastaliq stays with accessibility solved.

**Pragmatist**: Concurs. Component scope locked, timeline honest, parallel tracks eliminated. Darkened saffron for text accepted.

**Skeptic**: Concurs with reservation. Day 3 gate is the spike — objective criteria, fallback defined. Asymmetric grid risk accepted with single-query mobile fallback. Component-after-page sequencing accepted.

---

**Next Action**: Frontend lead begins Phase 1 (tokens + grid spec) today. Day 3 gate review scheduled for 2026-11-07.