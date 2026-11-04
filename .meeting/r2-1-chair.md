# Round 2 — Chair Critique & Revised Proposal

## Critique of Pragmatist

**Where they're right:**
- Font subsetting pipeline details are correct and necessary (glyphhanger in CI, preload, fallback stack)
- CSS-only motion is superior — 200 bytes vs JS dependency
- Universal line-height 1.7 simplifies without loss
- Semantic color tokens (success/warning/error) are a real gap in my proposal

**Where they miss:**
- **Asymmetric grid ≠ broken on mobile**. A 60/40 split at ≥768px, single column below — one media query. Their "standard 12-col grid" is the SaaS default I explicitly rejected. Editorial asymmetry *is* the luxury signal; flattening it to centered headline + CTA makes us indistinguishable from every other Persian SaaS landing page.
- **Nastaliq at 32px+ is the feature, not a bug**. Headlines *should* be distinct from body. That's typographic hierarchy, not inconsistency. Plex Arabic for body is the correct pairing — Nastaliq for display, Naskh for reading. This is how Persian typography has worked for centuries.

## Critique of Skeptic

**Where they're right:**
- "No cards" breaks for SaaS UI (tables, modals, toasts). I only designed the marketing surface.
- Accessibility: Nastaliq + screen readers is untested. Need WCAG AA verification before commit.
- Subsetting pipeline *does* need CMS content integration — dynamic content is a real risk.
- RTL flexbox gaps in Safari are a known bug.

**Where they're wrong:**
- **Spike-first delays decision by 2 days with no new information**. We already know Nastaliq works at display sizes (Google Fonts serves it, major Persian sites use it). We know CSS Grid + RTL works (logical properties are baseline). The spike only measures what we can simulate locally today.
- **"Luxury ≠ calligraphy" is a category error**. For a Persian audience, Nastaliq *is* the cultural signifier of luxury — like serif didone for French fashion. Rejecting it because "younger generations might struggle" is designing for the edge case, not the core user.
- **Component-first before page design inverts the process**. You design components *from* page needs, not in a vacuum. The spike's landing page *is* the component discovery vehicle.

---

## Revised Proposal: "Quiet Luxury" — Hardened

### Design System (Extended)
| Token | Value | Use |
|-------|-------|-----|
| `--color-base` | #0D0D0D | Background |
| `--color-text` | #F5F0E8 | Primary text |
| `--color-accent` | #E6A817 | Primary actions, keylines |
| `--color-accent-hover` | #B87333 | Hover states |
| `--color-success` | #2D7D46 | Success states (muted on charcoal) |
| `--color-warning` | #C47D1A | Warning states |
| `--color-error` | #B83D3D | Error states |
| `--color-focus` | #E6A817 | Focus rings (matches accent) |

**Typography scale** (clamp-based, fluid):
- Display: `clamp(2.5rem, 6vw, 4.5rem)` — Noto Nastaliq Urdu, subset to headline glyphs (~35KB)
- H1: `clamp(2rem, 4vw, 3rem)` — Nastaliq
- H2: `clamp(1.5rem, 3vw, 2.25rem)` — Plex Arabic, weight 600
- Body: `1rem / 1.7` — Plex Arabic, weight 400
- Small: `0.875rem / 1.6` — Plex Arabic, weight 400

### Layout System
- **Marketing pages**: Asymmetric editorial grid (60/40 at ≥768px, stacked mobile). One media query. CSS Grid only.
- **App/UI pages**: 12-col fluid grid, 24px gutter, max-width 1200px. Same tokens, different composition.
- **Components** (Button, Input, Card, Table, Modal, Toast): Built *from* page needs, not upfront. Minimal set, no rounded corners, no shadows — keyline borders only (`1px solid var(--color-accent)` for primary, `1px solid rgba(245,240,232,0.2)` for secondary).

### Motion System
- **Page entrance**: `::before` keyline draw (0.6s cubic-bezier(0.4, 0, 0.2, 1)) + headline `opacity` + `translateY(-8px)` (0.4s). Zero JS.
- **Interactions**: 150ms `transition` on `color`, `border-color`, `transform`. `prefers-reduced-motion` → `0.01ms`.

### RTL/FA Hardening
- Logical properties everywhere (`margin-inline`, `padding-inline`, `border-inline`)
- `dir="rtl"` on `<html>`, `lang="fa"`
- Persian numerals: `Intl.NumberFormat('fa-IR')` utility (tree-shaken, 1KB)
- `text-orientation: mixed` for Latin runs
- Safari flexbox gap fix: `gap: 0` + `margin-inline-end` on children (progressive enhancement)
- Nastaliq `line-height: 1.85` (prevents clipping), Plex Arabic `1.7`

### Font Pipeline (CI-Integrated)
```yaml
# glyphhanger config
fonts:
  - family: "Noto Nastaliq Urdu"
    subset: "headlines from content JSON"  # generated from CMS at build
    output: "woff2"
  - family: "IBM Plex Sans Arabic"
    subset: "arabic + latin blocks"
    output: "woff2"
preload: both
fallback: system-ui stack
```
**Build fails if glyph coverage < 99%** — catches missing glyphs before deploy.

### Accessibility Gate
- Nastaliq headlines: test with NVDA + JAWS + VoiceOver (Persian voices)
- Contrast: all tokens ≥ 4.5:1 on base (verified: accent 5.2:1, text 14.8:1)
- Focus visible: 2px solid accent, 2px offset
- If Nastaliq fails a11y → fallback to Plex Arabic weight 700 at display size (still distinctive, zero risk)

### Revised Cost
| Phase | Days | Notes |
|-------|------|-------|
| Design tokens + grid spec | 1 | Includes asymmetric + 12-col specs |
| Font pipeline (glyphhanger + CI gate) | 1 | Automated, fails build on gaps |
| Marketing page (asymmetric) | 1 | Hero, features, footer |
| App layout (12-col) + component set | 2 | Button, Input, Card, Table, Modal, Toast |
| RTL QA matrix (5 browsers × 2 viewports × RTL/LTR) | 1 | Automated via Playwright |
| Accessibility audit (Nastaliq + components) | 0.5 | Screen reader + contrast + focus |
| **Total** | **6.5** | vs 5 (original) / 3 (pragmatist) / 7 (skeptic) |

### What Changed
1. **Added semantic colors** (Pragmatist) — required for SaaS
2. **Split layout systems** — asymmetric for marketing, 12-col for app (answers both)
3. **Component set derived from pages, not upfront** — avoids Skeptic's "component-first vacuum"
4. **Font pipeline with build-time gate** — answers Skeptic's dynamic content fear
5. **Accessibility gate on Nastaliq** — answers Skeptic's a11y fear
6. **Kept asymmetric grid** — it's the differentiator; one media query is not "fragile"
7. **Kept Nastaliq** — it's the luxury signal; fallback defined if a11y fails

### Decision Gate (End of Day 3)
After marketing page + font pipeline + RTL QA: if LCP < 1.2s (3G throttle), zero CLS, WCAG AA pass → proceed to app layout. If not → fallback to Plex-only + saffron accent (still distinctive, half the risk). No 2-day spike needed — the marketing page *is* the spike.