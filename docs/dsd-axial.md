# Design System Document (DSD)

**System name:** Axial Foundation  
**Date:** 2026-05-14  
**Version:** 0.2  
**Owner:** Axial Product Lead  
**Status:** Draft  
**Foundation:** [Axial.md](../Axial.md)  
**PRD:** [prd-axial.md](prd-axial.md)

**Related:** [BRD](brd-axial.md) · [SDD](sdd-axial.md) · [GTM](gtm-axial.md)

---

## 1. Design Philosophy and Vision

**Archetype:** The Architect — meticulous, structural, unhurried. Axial does not feel like a startup racing to ship; it feels like a system that was designed to be correct and will remain so. See [Axial.md §6](../Axial.md).

**Core aesthetic:** Minimal and modern. Dark-mode-first. Generous negative space. Glassmorphism for depth and hierarchy — frosted panels over deep, subtle gradients — not decoration. The experience is institutional but not cold. It mirrors blockchain transparency: visible yet secure.

**Emotional intent:** Users feel in control and oriented, not rushed or shamed. Liquidity and compliance status read as ambient reassurance — soft glow, quiet checkmarks — not alarmist red banners.

**Aesthetic references:** Linear (clarity and focus), Raycast (dark chrome and speed), Stripe Dashboard (trust and financial legibility) — adapted to the Philippine MSME context and Axial's glass materiality.

**What this system explicitly avoids:**
- Legacy ERP data soup and overwhelming grid density
- Glassmorphism without sufficient contrast or legibility
- Aggressive motion, looping decorative animations, or notification spam
- Alarmist microcopy (ALL CAPS, "URGENT" defaults, shame-driven language)
- Pill-shaped buttons — use slightly rounded rectangles to maintain the architectural, grid-based identity

---

## 2. Design Tokens

These are the canonical values. Implement as CSS custom properties or Tailwind theme extensions. The Tailwind config in `prototype/tailwind.config.ts` is the authoritative implementation reference.

### 2.1 Color Palette

**Base surface (dark-mode-first):**

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0B0E14` | Page background (obsidian) |
| `surface-container-lowest` | `#080f14` | Deepest inset surfaces |
| `surface-container-low` | `#161c22` | Inset panels |
| `surface-container` | `#1a2026` | Standard card surface |
| `surface-container-high` | `#242b31` | Elevated cards |
| `surface-container-highest` | `#2f353c` | Highest elevation panels |
| `--color-surface` | `rgba(20, 26, 36, 0.72)` | Glass cards over blur |
| `--color-border` | `rgba(148, 163, 184, 0.18)` | Dividers, input borders |

**Semantic colors:**

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#2DD4BF` | CTAs, active states, bioluminescent teal — use for live/active/success states only |
| `--color-primary-hover` | `#5EEAD4` | Hover on primary |
| `--color-text` | `#F1F5F9` (`on-surface: #dde3eb`) | Body copy |
| `--color-text-muted` | `#94A3B8` (`on-surface-variant: #c6c6cd`) | Secondary text, labels |
| `--color-accent-soft` | `#CBD5E1` | Soft silver highlights, secondary emphasis |
| `--color-success` | `#34D399` | Confirmations, "synced" state |
| `--color-warning` | `#FBBF24` | T+3 window approaching, caution |
| `--color-error` | `#F87171` (`error: #ffb4ab`) | Errors, destructive intent — use sparingly |

**Material Design 3 extended palette (for Tailwind theme):**

```yaml
primary: '#bec6e0'
on-primary: '#283044'
primary-container: '#0f172a'
on-primary-container: '#798080'
secondary: '#bcc7de'
on-secondary: '#263143'
secondary-container: '#3e495d'
on-secondary-container: '#aeb9d0'
tertiary: '#dec29a'
on-tertiary: '#3e2d11'
tertiary-container: '#231500'
outline: '#909097'
outline-variant: '#45464d'
inverse-surface: '#dde3eb'
inverse-on-surface: '#2b3137'
```

### 2.2 Typography

**Primary font:** Geist — bridges monospaced aesthetic and professional sans-serif; ideal for financial data and blockchain interfaces. Loaded in root layout via Google Fonts or self-hosted.

**Type scale:**

| Role | Token | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Display | `headline-xl` | 48px | 600 | 1.1 | -0.02em |
| Heading 1 | `headline-lg` | 32px | 600 | 1.2 | -0.01em |
| Heading 2 | `headline-md` | 24px | 500 | 1.3 | -0.01em |
| Heading 1 (mobile) | `headline-lg-mobile` | 28px | 600 | 1.2 | — |
| Body large | `body-lg` | 18px | 400 | 1.6 | 0 |
| Body default | `body-md` | 16px | 400 | 1.5 | 0 |
| Label / UI | `label-md` | 14px | 500 | 1.4 | 0.02em |
| Caption / meta | `label-sm` | 12px | 600 | 1.2 | 0.05em |
| Monospace | `mono` | 13px | 400 | 1.5 | — |

**Principles:** Generous line heights throughout. Condensed tracking in headlines. Metadata uses `label-sm` with increased letter spacing — evokes meticulously organized documentation. Avoid heavy weights unless critical for financial figures; let layout carry the emphasis.

Preload weights 500 and 600 for UI performance.

### 2.3 Spacing

**Base unit:** 8px. All spacing is a multiple of 8 (not 4 — adjusted from earlier drafts to match `prototype/tailwind.config.ts`).

| Token | Value | Usage |
|---|---|---|
| `unit` | 8px | Base unit |
| `--space-1` | 4px | Tight internal gaps |
| `--space-2` | 8px | Component padding |
| `--space-3` | 12px | — |
| `--space-4` | 16px | Default element spacing |
| `--space-6` | 24px | Section gaps |
| `--space-8` | 32px | Large section gaps |
| `--space-12` | 48px | Page-level spacing |
| `gutter` | 32px | Grid column gutters |
| `margin-desktop` | 64px | Outer page margins |
| `margin-tablet` | 32px | — |
| `margin-mobile` | 20px | — |
| `container-max` | 1440px | Maximum content width |

### 2.4 Elevation and Depth

Depth is achieved through glassmorphism and layered transparency — not traditional drop shadows.

**The four layers:**
1. **Base:** Obsidian canvas (`#0B0E14`)
2. **Surface:** Deep Slate at 40–60% opacity with `backdrop-filter: blur(20px)` — glass cards
3. **Accent:** Subtle 1px Soft Silver borders at 10% opacity — defines card edges
4. **Interaction:** Bioluminescent Teal glows for active states and successful validations

**Elevation tokens:**

| Token | CSS value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.35)` | Inline cards |
| `--shadow-md` | `0 12px 40px rgba(0,0,0,0.45)` | Floating panels, modals |
| `--shadow-glow` | `0 0 24px rgba(45,212,191,0.12)` | Subtle success / active liquidity line |
| Teal active glow | `0 0 15px rgba(45,212,191,0.3)` | Active swap, pending blockchain state |

**Glass recipe (baseline):** `backdrop-blur: 12–16px`, `background: --color-surface`, `border: 1px solid --color-border`. Optional inner highlight at ~6% white on top edge.

### 2.5 Shape and Radius

Shape language is **Soft Level 1** — disciplined rounding, not pill shapes. Maintains the architectural, grid-based identity.

| Token | Value | Usage |
|---|---|---|
| `rounded-sm` | `0.125rem` (2px) | — |
| `rounded` (DEFAULT) | `0.25rem` (4px) | Standard containers, crisp professional edge |
| `rounded-md` | `0.375rem` (6px) | — |
| `rounded-lg` | `0.5rem` (8px) | Cards, primary dashboard containers |
| `rounded-xl` | `0.75rem` (12px) | Modals |
| `rounded-full` | `9999px` | Badge/status indicators only |

---

## 3. Layout and Grid

**Grid:** 12-column fluid on desktop, 4-column on mobile. Max width: 1440px. Fixed-width grid within fluid container — prevents data points from stretching on ultra-wide monitors.

**Breakpoints:**
- Mobile: 375px
- Tablet: 768px
- Desktop: 1280px+

**Layout philosophy:** Expansive margin and gutter system. Dark space (negative space) is a functional element — it separates concerns and reduces cognitive load during high-stakes financial decisions. Never cramped.

---

## 4. Core Component Specifications

### Buttons

| Variant | Background | Text | Border | Hover | Disabled |
|---|---|---|---|---|---|
| Primary | `--color-primary` | `#0B0E14` | none | `--color-primary-hover` | 40% opacity |
| Secondary | transparent | `--color-primary` | `1px solid --color-primary` | subtle surface fill | 40% opacity |
| Ghost | transparent | `--color-text` | none | `--color-surface` fill | 40% opacity |
| Destructive | `--color-error` | white | none | darken ~8% | 40% opacity |

**Specs:** Border radius `8px` · Padding `10px 16px` · Font weight `500`, size `14px`. No pill shapes.

### Inputs and Forms

- Border: `1px solid --color-border` (inactive) → full Soft Silver border (focused)
- Border radius: `8px`
- Focus ring: `2px solid --color-primary`, offset `2px`
- Error: `--color-error` border + caption below (optionally a subtle red underglow)
- Padding: `10px 12px`
- Financial inputs: bottom-border-only approach for inactive states — minimal, uncluttered

### Cards and Surfaces

- Background: `--color-surface` with `backdrop-blur: 12–16px`
- Border: `1px solid --color-border`
- Border radius: `8px` (standard cards) — `12px` (primary dashboard containers)

### Modals

- Background: `--color-surface` with blur
- Border radius: `12–16px`
- Backdrop: `rgba(5,8,12,0.65)` + `blur(8px)`
- Shadow: `--shadow-md`
- Open: 200ms ease-out, fade + 4px translate up
- Close: 150ms ease-in

### Data Tables

- No vertical borders
- Subtle horizontal dividers: Soft Silver at 10% opacity
- Header row: `label-sm` typography — professional, institutional
- No alternating row colors (use dividers only)

### Status and Success Indicators

- Active swap / pending blockchain state: Teal glow `box-shadow: 0 0 15px rgba(45,212,191,0.3)` + pulse animation
- Synced / completed state: `--color-success` checkmark or soft glow — no modal, no push notification
- Warning (T+3 approaching): `--color-warning` — calm indicator, not a banner
- Error: `--color-error` — use sparingly; always provide a human-readable next step

---

## 5. Navigation: Four Primary Tabs

Root authenticated layout uses a sidebar (desktop) or bottom tab bar (mobile). Four tabs, fixed order.

| Tab | Label | Route | Icon (Material Symbols) |
|---|---|---|---|
| 1 | Liquidity | `/liquidity` | `currency_exchange` or `swap_horiz` |
| 2 | Compliance | `/compliance` | `verified` or `shield_check` |
| 3 | Overview | `/` | `grid_view` or `dashboard` |
| 4 | Settings | `/settings` | `settings` |

**Tab states:**

| State | Appearance |
|---|---|
| Active | `--color-primary` bottom indicator or filled pill; label weight `600`; optional `--shadow-glow` on icon only |
| Inactive | `--color-text-muted`; no glow |
| Hover (pointer) | Text → `--color-text`; transparent or 5% white overlay |
| Focus (keyboard) | Visible focus ring on tab control; `aria-selected` on active |

**Keyboard:** Arrow Left/Right to move between tabs; Home/End to first/last. Activation follows focus (roving tabindex — pick one pattern and document it in the component).

**Touch:** Minimum 44×44px hit target including icon and label.

**Deep links:** Each tab maps to a route. Preserve tab state on refresh.

---

## 6. Motion and Micro-interactions

**Default transition:** `150ms ease-out` for color, opacity, and transform.

| Interaction | Duration | Easing | Notes |
|---|---|---|---|
| Button hover/active | 120ms | ease-out | — |
| Modal open | 200ms | ease-out | Fade + 4px translate up |
| Modal close | 150ms | ease-in | — |
| Tab switch | 180ms | ease-in-out | Content cross-fade optional |
| Loading skeleton | 1.5s | linear | Shimmer; respect reduced motion |
| Blockchain pending pulse | 2s | ease-in-out | Soft teal pulse on pending state indicators |

**Avoid:** Transitions over 400ms; looping decorative motion; motion that does not signal a state change.

---

## 7. Accessibility

- **Contrast:** WCAG AA minimum — 4.5:1 text, 3:1 UI components. Verify teal (`#2DD4BF`) on obsidian (`#0B0E14`) for small text specifically — this pair is close to the threshold.
- **Focus:** Never remove focus outlines without a stronger visible replacement.
- **Touch targets:** Minimum 44×44px for all interactive elements.
- **Keyboard:** Full primary flows navigable without a pointer device.
- **Screen readers:** Semantic tab list with `role="tablist"`, `role="tab"`, `aria-selected`; landmark regions per major surface.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` — replace shimmer with opacity pulse; shorten or disable transitions.

---

## 8. Taste-Skill Settings

```
DESIGN_VARIANCE:    4   # Coherent, restrained expression — not rigid, not chaotic
MOTION_INTENSITY:   2   # Subtle only; motion serves state signaling, not aesthetics
VISUAL_DENSITY:     6   # Information-dense but breathable for finance/compliance workflows
```

**Rationale:** Finance and compliance workflows require high information density (6) to be useful. Motion must not distract during high-stakes actions (2). Expression stays restrained and consistent — the architect does not decorate (4).

---

## 9. Microcopy Guidelines

| Context | Don't write | Write instead |
|---|---|---|
| Payroll confirmed | "✅ PAYROLL PROCESSED!" | "Payroll routed. SSS, PhilHealth, and Pag-IBIG contributions dispatched." |
| EIS submission success | "BIR submission complete! 🎉" | "BIR EIS accepted. Reference: EIS-2026-XXXXX · Stellar memo: [hash]" |
| T+3 window approaching | "⚠️ URGENT: Submit now!" | "EIS window closes in 18 hours. One submission pending." |
| Swap pending | "Waiting for blockchain confirmation..." | "Swap processing on Stellar. Typically 3–5 seconds." |
| Error (submission failed) | "ERROR: BIR API REJECTED YOUR SUBMISSION" | "BIR submission returned an error. Retrying automatically — no action needed yet. Reference: [id]" |

**Rules:**
- Never all-caps for status messages
- Always include the relevant reference ID when one exists
- Always tell the user what is happening next — never leave them in a void
- Assume the user is intelligent, not careless

---

## 10. Anti-Pattern Register

| Pattern | Status | Fix |
|---|---|---|
| Alarmist microcopy (URGENT, all-caps) | Never use | See §9 microcopy guidelines |
| Glassmorphism without contrast verification | Block on implementation | Run WCAG AA check on every glass surface |
| Pill-shaped primary buttons | Never use | Use slightly rounded rectangles (8px radius) |
| Looping decorative animations | Never use | Motion must signal state change |
| Secrets or API keys visible in UI | Never | Vault references only; see SDD §7 |
| Raw blockchain hashes as the only status | Never | Always pair with human-readable state label |

Run `npx impeccable detect src/` after first UI implementation round.

---

## Self-Check

- [x] Section 2 has concrete hex values and YAML tokens for Tailwind theme alignment
- [x] Section 2.3 spacing scale matches `prototype/tailwind.config.ts` (8px base unit)
- [x] Section 4 includes button, input, card, modal, status, and table specs
- [x] Section 5 covers tab active/inactive/hover/focus and keyboard behavior
- [x] Section 9 microcopy has concrete before/after examples
- [ ] WCAG AA verification pass required on implemented components — especially teal on obsidian for small text
- [ ] Tokens reflected in CSS custom properties or Tailwind theme extension in code (check `prototype/tailwind.config.ts`)
