# Round 2 — Skeptic Critique & Revised Proposal

## Critique: Chair

**Where they're wrong:**
- **Asymmetric grid is a mobile disaster**: 60/40 split on 375px viewport = 225px / 150px columns. Persian text at 150px wraps aggressively, breaks reading rhythm. Chair admits "generous negative space" — that space *is* the layout on mobile, and it collapses.
- **Nastaliq headline-only = brand inconsistency**: You get calligraphic luxury at 32px+, then utilitarian Plex at 16px. The visual jump signals "marketing page, not product." Users *feel* that disconnect.
- **`font-variant-alternates` 92% support is misleading**: That's global. In Iran, Safari on iOS (35% share) + older Chrome on Android (still common) = real gap closer to 15-20%. "Graceful degradation" to Plex Arabic means the luxury signal *disappears* for 1 in 5 users.
- **Zero SaaS UI coverage**: Chair's proposal is a landing page spec. No table, form, modal, toast, dropdown, date picker. "No cards" works for hero sections; it fails for settings panels.

**What they miss:**
- No component system = every new page = custom CSS = design drift within 3 months.
- Font subsetting pipeline for *dynamic* content (user-generated, CMS) is unsolved.
- No a11y audit plan for Nastaliq — screen readers, dyslexia, low vision.

---

## Critique: Pragmatist

**Where they're wrong:**
- **12-col grid ≠ simpler**: It's still a framework. 12 columns × 6 breakpoints × RTL flip = 72 grid states to QA. "Standard" grid still needs defensive CSS for Nastaliq line-height quirks.
- **35KB subset assumes static content**: `glyphhanger` scans *built* HTML. If headlines come from CMS/user input, you either over-subset (missing glyphs → tofu) or under-subset (bloat). Pragmatist hand-waves this.
- **`text-orientation: mixed` is a trap**: Supported in Firefox/Chrome, *not* Safari. Latin-in-Persian runs (common in tech UI: "API v2", "v1.0.3") will render sideways on iOS.
- **Line-height 1.7 universal is a lazy compromise**: Nastaliq needs 1.8+ for diacritic clearance; Plex Arabic reads fine at 1.6. Forcing 1.7 makes one font suboptimal everywhere.
- **24px Nastaliq fallback = untested claim**: "Tested readable" — by whom? On what devices? At what contrast ratio? WCAG AA for Persian script at 24px Nastaliq is unverified.
- **2.5 days dev time ignores component debt**: Grid + fonts + RTL QA = 2.5 days *for the marketing page*. SaaS components (table, form, modal, toast, select, date picker) = another 5-7 days minimum.

**What they miss:**
- Still no component library. "Shippable luxury" ships a landing page, not a product.
- Semantic color tokens (success/warning/error) need *five* accent colors minimum — not "one accent."
- Numeral utility is fine, but third-party components (charts, date pickers) won't use it.
- No plan for dark mode (charcoal base = dark mode only? What about light mode users?).

---

## Revised Proposal: "Spike → Gate → Component System"

### What I'd Do (Revised)
1. **Week 1 (2 days)**: Spike *one* critical page (landing) with:
   - Nastaliq headline (subset to 35KB) + Plex Arabic body
   - 12-col fluid grid + logical properties
   - CSS-only motion (keyline draw, headline fade-up)
   - Persian numerals via Intl utility
   - **Measure**: LCP on 3G (Chrome DevTools throttle), CLS, a11y audit (axe + manual screen reader), RTL breakage on 5 device/browser combos.

2. **Gate Criteria (must pass ALL)**:
   - LCP < 1.5s on simulated 3G
   - CLS = 0
   - WCAG AA (contrast, text spacing, screen reader)
   - Zero layout shift on RTL flip
   - Nastaliq headline readable at 32px on iOS Safari + Chrome Android

3. **If Gate Passes → Week 2-3: Component System First**:
   - Build minimal RTL component set: Button, Input, Select, Table, Modal, Toast, Card, Avatar, Badge, Tooltip
   - Each component: RTL-tested, a11y-tested, dark/light mode, Nastaliq-safe (headline only, min 32px)
   - Design tokens: 1 primary accent + 4 semantic (success/warning/error/info) + neutral scale
   - Font subsetting: CI pipeline with glyphhanger + *fallback glyph set* for dynamic content

4. **If Gate Fails → Fallback**: Plex Arabic only (headlines at 32px, body at 16px), saffron accent. Still distinctive, half the risk, ships in 3 days total.

### Why This Works
- **De-risks the biggest unknowns first** (Nastaliq legibility, RTL grid, subsetting) before investing in components.
- **Component-first prevents design drift** — every page uses the same tested primitives.
- **Gate is objective** — no "feels right," only measured pass/fail.
- **Fallback is shippable** — not a compromise, a valid alternative direction.

### Cost (Honest)
- **Spike**: 2 days
- **Gate evaluation**: 0.5 days
- **Component system (if gate passes)**: 5 days (not 2.5)
- **Full page build-out**: 3 days
- **Total if gate passes**: ~10.5 days (vs Chair's 5, Pragmatist's 3)
- **Total if gate fails**: 5.5 days (spike + fallback build)

### What I Still Won't Budge On
- No asymmetric grid — it's editorial indulgence, not product UI.
- No Nastaliq below 32px — accessibility floor, not preference.
- No "one accent" — SaaS needs semantic state colors.
- No zero-JS dogma — 2KB layout helper prevents 20KB defensive CSS.
- Component library before page library — always.