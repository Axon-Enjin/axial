# Design System & UX Guidelines

**System Name:** Axial Foundation  
**Date:** 2026-05-11  
**Version:** 0.1  
**Owner:** Axial Product Lead  
**PRD:** [prd-axial.md](prd-axial.md)

**Related:** [BRD](brd-axial.md) · [System Design](sdd-axial.md) · [Go-To-Market](gtm-axial.md)

---

## 1. Design Philosophy & Vision

**Core aesthetic:** Minimal, modern, and calm—**dark-mode-first**, generous negative space, glassmorphism used for **depth and hierarchy** (frosted panels over deep, subtle gradients), not decoration. Axial is the **Architect**: precise, unhurried, “invisible compliance” rather than noisy dashboards.

**Emotional intent:** Users feel **in control and oriented**, not rushed or shamed. Liquidity and compliance status read as **ambient reassurance** (soft glow, quiet checkmarks) rather than alarmist red banners.

**Aesthetic references:** Linear (clarity), Raycast (focused dark chrome), Stripe Dashboard (trust)—adapted to Philippine MSME context and **glass** materiality per [brand foundation](../initial-docs/Axial_Branding_Foundation.md).

**What this system explicitly avoids:**

- Legacy ERP “data soup” and dense grid overload  
- Glassmorphism without enough contrast or legibility  
- Aggressive motion, looping animations, or notification spam  
- Alarmist microcopy (ALL CAPS, “URGENT” defaults)

---

## 2. Brand Primitives

### Colors

*Dark-mode-optimized. All pairs below target WCAG AA for primary text where used as text/background; verify in implementation.*

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#0B0E14` | Page background (obsidian / deep slate) |
| `--color-surface` | `rgba(20, 26, 36, 0.72)` | Glass cards, panels (over blur + gradient) |
| `--color-border` | `rgba(148, 163, 184, 0.18)` | Dividers, input borders |
| `--color-primary` | `#2DD4BF` | CTAs, active states, bioluminescent teal accent |
| `--color-primary-hover` | `#5EEAD4` | Hover on primary |
| `--color-text` | `#F1F5F9` | Body copy |
| `--color-text-muted` | `#94A3B8` | Secondary text, labels |
| `--color-accent-soft` | `#CBD5E1` | Soft silver highlights, secondary emphasis |
| `--color-success` | `#34D399` | Confirmations, “synced” |
| `--color-warning` | `#FBBF24` | Window approaching (e.g. T+3), caution |
| `--color-error` | `#F87171` | Errors, destructive intent (use sparingly) |

### Typography

| Role | Font | Weight | Size | Line Height |
|------|------|--------|------|-------------|
| Heading 1 | Inter, system-ui | 600 | 28px | 1.2 |
| Heading 2 | Inter, system-ui | 600 | 22px | 1.25 |
| Heading 3 | Inter, system-ui | 600 | 17px | 1.3 |
| Body | Inter, system-ui | 400–500 | 15px | 1.55 |
| Small / Caption | Inter, system-ui | 400 | 13px | 1.45 |
| Mono / Code | JetBrains Mono, ui-monospace | 400 | 13px | 1.5 |

**Font loading:** Google Fonts or self-hosted; preload primary weights **500/600** for UI.

### Elevation & Depth

| Level | CSS Value | Usage |
|-------|-----------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.35)` | Inline cards |
| `--shadow-md` | `0 12px 40px rgba(0,0,0,0.45)` | Floating panels, modals |
| `--shadow-glow` | `0 0 24px rgba(45,212,191,0.12)` | Subtle success / active liquidity line |

**Glass recipe (baseline):** backdrop blur `12–16px`, semi-transparent surface token, **1px** hairline border, inner highlight optional at **~6%** white top edge.

---

## 3. Layout & Spatial System

**Base unit:** `4px` — spacing is a multiple of 4.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Tight internal gaps |
| `--space-2` | `8px` | Component padding |
| `--space-3` | `12px` | — |
| `--space-4` | `16px` | Default element spacing |
| `--space-6` | `24px` | Section gaps |
| `--space-8` | `32px` | Large section gaps |
| `--space-12` | `48px` | Page-level spacing |

**Grid:** 12-column fluid, max-width **1280px**, gutters **24px**.

**Breakpoints:**

- Mobile: `375px`  
- Tablet: `768px`  
- Desktop: `1280px`

---

## 4. Core Component Specs

### Buttons

| Variant | Background | Text | Border | Hover | Disabled |
|---------|-----------|------|--------|-------|----------|
| Primary | `--color-primary` | `#0B0E14` | none | `--color-primary-hover` | 40% opacity |
| Secondary | transparent | `--color-primary` | `--color-primary` | subtle surface fill | 40% opacity |
| Ghost | transparent | `--color-text` | none | `--color-surface` | 40% opacity |
| Destructive | `--color-error` | white | none | darken ~8% | 40% opacity |

**Border radius:** `8px`  
**Padding:** `10px 16px`  
**Font:** weight `500`, size `14px`

### Inputs & Forms

- Border: `1px solid --color-border`  
- Border radius: `8px`  
- Focus ring: `2px solid --color-primary`, offset `2px`  
- Error: `--color-error` border + caption below  
- Padding: `10px 12px`

### Surfaces (Cards, Modals, Panels)

- Background: `--color-surface` + blur  
- Border: `1px solid --color-border`  
- Border radius: `12px` (cards), `16px` (modals)  
- Modal backdrop: `rgba(5,8,12,0.65)` + `blur(8px)`

### Primary navigation (four tabs)

Root **authenticated** layout uses a **horizontal tab bar** (bottom on narrow mobile, top or bottom per platform convention—**implement consistently**).

| Concern | Specification |
|---------|----------------|
| **Tab list** | Four items, order: **Liquidity**, **Compliance**, **Overview**, **Settings** (matches [PRD §5](prd-axial.md); label strings may shorten on XS) |
| **Active state** | `--color-primary` bottom indicator **or** filled pill; label weight **600**; optional `--shadow-glow` **only** on active tab icon |
| **Inactive** | `--color-text-muted`; no glow |
| **Hover** (pointer) | Text → `--color-text`; background **transparent** or **5%** white overlay on pill |
| **Focus (keyboard)** | Visible focus ring on the tab **control**; `aria-selected` on active; `role="tab"` / `role="tablist"` |
| **Keyboard** | `Arrow Left/Right` moves focus between tabs; `Home` / `End` to first/last; **activation** follows focus (selection model) or use roving tabindex—pick one and document in component |
| **Touch** | Min target **44×44px** including icon+label hit area |

**Deep links:** Each tab maps to a route (`/liquidity`, `/compliance`, `/overview`, `/settings`). Preserve tab when refreshing where possible.

---

## 5. Motion & Micro-interactions

**Transition default:** `150ms ease-out` for color/opacity/transform.

| Interaction | Duration | Easing | Notes |
|-------------|----------|--------|-------|
| Button hover/active | `120ms` | ease-out | |
| Modal open | `200ms` | ease-out | Fade + 4px translate up |
| Modal close | `150ms` | ease-in | |
| Tab switch | `180ms` | ease-in-out | Content cross-fade optional |
| Loading skeleton | `1.5s` | linear | Shimmer; respect reduced motion |

**Avoid:** Over **400ms** transitions; looping decorative motion; motion that does not signal state change.

---

## 6. Accessibility (a11y)

- **Contrast:** WCAG AA — **4.5:1** text, **3:1** UI components (verify teal on obsidian for small text).  
- **Focus:** Never remove outlines without a stronger replacement.  
- **Touch targets:** Minimum **44×44px**.  
- **Keyboard:** Full primary flows without pointer.  
- **Screen readers:** Semantic tabs; landmark regions per surface.  
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` — replace shimmer with pulse opacity; shorten transitions.

---

## 7. Taste-Skill Settings

```
DESIGN_VARIANCE:    4
MOTION_INTENSITY:   2
VISUAL_DENSITY:     6
```

**Dial rationale:** Coherent, restrained expression (**4**); subtle motion only (**2**); information-dense but still breathable (**6**) for finance + compliance workflows.

**Chosen variant:** aligned with **minimalist-skill** / restrained system—implement as project skill when available.

---

## 8. Impeccable Anti-Pattern Register

| Pattern | Status | Location | Fix Applied |
|---------|--------|----------|-------------|
| — | — | — | Run `npx impeccable detect src/` after first UI implementation |

---

## Self-Check

- [x] Section 2 uses concrete hex values aligned to brand obsidian / teal / silver  
- [x] Section 3 spacing scale is 4px-based  
- [x] Section 4 includes tab **active/inactive/hover/focus** and keyboard behavior  
- [x] Section 7 taste dials set  
- [ ] WCAG verification pass on implemented components  
- [ ] Tokens reflected in CSS variables or Tailwind theme in code
