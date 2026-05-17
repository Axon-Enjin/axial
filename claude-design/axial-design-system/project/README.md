# Axial Design System

> **Instant capital, invisible compliance.**
> The visual + interaction system for Axial — a liquidity and compliance engine for Philippine MSMEs.

This is a working design system for the **Axial** brand. It captures color, type, spacing, motion, microcopy and UI components from the canonical product spec and prototype, packaged for use by design agents producing slides, mocks, prototypes, and production code in the Axial visual language.

---

## What Axial is

Axial is a liquidity and compliance engine for Philippine MSMEs. It solves two structural problems at once:

- A **$221B cash-flow gap** caused by Net 60–90 B2B payment terms — by tokenizing receivables on Stellar/Soroban and executing instant USDC atomic swaps.
- **Manual, error-prone BIR/statutory compliance** — by routing SSS/PhilHealth/Pag-IBIG payroll splits and JWS-signed BIR EIS submissions automatically in the background.

Settlement asset is **USDC on Stellar**. User-facing denomination is **PHP**. FX happens at the edges (PDAX). Designed Philippines-jurisdiction-first.

**Built for:** Build on Stellar Philippines Hackathon 2026 (May 18–24, 2026). Three devs, seven days.

## Sources

Everything in this system was derived from the upstream repo. If you have access, browse it for deeper context — especially `docs/Axial.md`, `docs/dsd-axial.md`, and `prototype/components/stitch/*`.

| Source | Link |
|---|---|
| Canonical foundation doc | `docs/Axial.md` in [Axon-Enjin/axial](https://github.com/Axon-Enjin/axial) |
| Design System Doc (DSD) | [`docs/dsd-axial.md`](https://github.com/Axon-Enjin/axial/blob/main/docs/dsd-axial.md) |
| Go-To-Market | [`docs/gtm-axial.md`](https://github.com/Axon-Enjin/axial/blob/main/docs/gtm-axial.md) |
| PRD / SDD / BRD | [`docs/`](https://github.com/Axon-Enjin/axial/tree/main/docs) |
| Reference Stitch components (Next.js) | [`prototype/components/stitch/`](https://github.com/Axon-Enjin/axial/tree/main/prototype/components/stitch) |
| Tailwind theme | [`prototype/tailwind.config.ts`](https://github.com/Axon-Enjin/axial/blob/main/prototype/tailwind.config.ts) |
| Reference screen renders (4 PNGs) | `prototype/public/design-reference/` |

A snapshot of the four reference screens lives in [`assets/screens/`](assets/screens). The reference Stitch components live in [`reference/`](reference) — read these to understand intended interaction patterns when extending the kit.

---

## Index — what's in this folder

```
.
├── README.md                 ← this file
├── SKILL.md                  ← Claude Code skill entry point
├── colors_and_type.css       ← every token (color, type, spacing, radius, shadow, motion)
├── assets/
│   ├── logos/
│   │   ├── axial-mark.svg    ← 40×40 compass mark on a surface chip
│   │   └── axial-lockup.svg  ← mark + "Axial MVP / ARCHITECT MODE"
│   └── screens/              ← 4 PNG references (Overview/Liquidity/Compliance/Settings)
├── reference/                ← original Stitch (Next.js + Tailwind) source — read for fidelity
├── preview/                  ← Design System tab cards (HTML, ~700px wide)
└── ui_kits/
    └── axial-app/            ← interactive React UI Kit (click-through Overview/Liquidity/Compliance/Settings)
        ├── index.html
        ├── primitives.jsx    ← Icon · Button · Card · StatusBadge · StatTile · Field · Toggle · Avatar
        ├── Sidebar.jsx
        ├── TopBar.jsx
        ├── Overview.jsx
        ├── Liquidity.jsx
        ├── Compliance.jsx
        └── Settings.jsx
```

To add Axial to any HTML file, just link the CSS:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap">
<link rel="stylesheet" href="colors_and_type.css">
```

Then use CSS variables (`var(--color-primary)`, `var(--font-sans)`, etc.) or the helper classes (`.axl-glass`, `.axl-h1`, `.material-symbols-outlined`).

---

## Content fundamentals

The brand archetype is **The Architect** — meticulous, structural, unhurried. Axial does not feel like a startup racing to ship; it feels like a system that was designed to be correct and will remain so.

### Tone

- **Institutional, not corporate.** Reads like well-kept documentation, not marketing.
- **Calm, never alarmist.** "EIS window closes in 18 hours" — not "⚠️ URGENT: Submit now!"
- **Confidence without bravado.** State facts. Provide references. Don't promise.
- **Assume the reader is intelligent**, not careless. Skip handholding modals.

### Casing

- **Sentence case** for headings, descriptions, and button labels. ("Unlock Capital", "Liquidity Engine", "Filing Milestones".) Title Case is used only on canonical product surface names like *Architectural Settings* and *Compliance Ledger*.
- **UPPERCASE** is reserved for label-sm metadata only (column headers, eyebrow labels, status pill text). Wide letter-spacing (`0.05em`) reinforces the "documented" feel.
- **NEVER all-caps for status messages or alerts.** "BIR Payload accepted" — not "BIR PAYLOAD ACCEPTED".

### Person

- **"You"** when addressing the user. ("Drag and drop verified PDF or XML invoices.")
- **"We" / "Axial"** when the system is the actor. ("Axial absorbs execution friction.") Avoid first-person plural except in copy intended for sales/explanation surfaces — in-product, prefer naming the system or the action directly: "Retrying automatically — no action needed yet."
- **Third-person passive for system state.** "Payroll routed." "BIR EIS accepted."

### Vibe & vocabulary

Words that *belong* in Axial copy: *axis · ledger · routed · synchronized · verified · settled · payload · bridge · execution · architecture · architect · obsidian · pipeline · pulse · reserve wallet · T+3 window · atomic swap · statutory split.*

Words that *don't*: *easy · simple · just · super · awesome · seamless · revolutionize · disrupt · synergy · best-in-class · 🎉🚀.*

### Emoji

**Never.** Material Symbols only — see *Iconography*. The only symbolic accents in copy are the **peso glyph `₱`** for amounts and **ASCII hyphens / em-dashes** for clauses.

### Microcopy patterns

```
Status confirmation        → "<noun> <past-participle>. <relevant ref or context>."
                             "BIR EIS accepted. Reference: EIS-2026-991A."

Status pending             → "<noun> processing on <substrate>. Typically <n>–<m> seconds."
                             "Swap processing on Stellar. Typically 3–5 seconds."

Warning (T+3 approaching)  → "<deadline> in <n> hours. <count> <noun> pending."
                             "EIS window closes in 18 hours. One submission pending."

Error (recoverable)        → "<system> returned an error. Retrying automatically —
                              no action needed yet. Reference: <id>"

Empty / awaiting           → "Awaiting <event> to <verb> <noun>."
                             "Awaiting token finality to open order book."
```

Always include the reference ID when one exists. Always tell the user what is happening next — never leave them in a void.

---

## Visual foundations

### Color

**Dark-mode first.** The canvas is **Obsidian (`#0B0E14` / `#0e141a`)** — never pure black. Above it sits a 6-step **deep-slate elevation ladder** (`#080f14 → #2f353c`) plus translucent glass surfaces over those.

The primary accent is **Soft Silver (`#bec6e0`)** — used for CTAs, the active sidebar rail, and the brand mark. It carries a subtle 10% primary glow on shadows. Reserved exclusively for the highest-priority CTA on a surface.

The system has one **"bioluminescent teal" (`#2DD4BF`)** — used *only* for live, active, pending-blockchain, and success states. The teal glow (`box-shadow: 0 0 15px rgba(45,212,191,0.30)`) marks ambient activity — a pulse on the active pipeline node, a dot on Network Active, a checkmark on Synchronized. Never use teal as a generic brand color; it earns its meaning by being rare.

Warning (`#FBBF24`), error (`#ffb4ab`), and tertiary sand (`#dec29a`) are used sparingly and never as fills — only borders + foreground over a glass surface.

**Foreground hierarchy:** `on-surface` (`#dde3eb`) for primary text · `on-surface-variant` (`#c6c6cd`) for labels and secondary copy · `outline` (`#909097`) for tertiary metadata.

### Typography

**Geist** sans (primary) and **Geist Mono** (IDs, hashes, references). Loaded from Google Fonts.

- **Display (48 / 600 / -0.02em)** — only the biggest figure on a screen (Available Liquidity, Gross Payroll Pool).
- **Headline-lg (32 / 600 / -0.01em)** — page titles like "Compliance Ledger".
- **Headline-md (24 / 500)** — section titles.
- **Body (16 / 400 / 1.5)** — primary copy with generous line-height.
- **Label-md (14 / 500 / 0.02em)** — button labels, links, table cells.
- **Label-sm (12 / 600 / 0.05em, UPPERCASE)** — column headers, eyebrow labels, status pill text. This is what gives the system its "documented" feel.
- **Mono (13 / 400)** — `INV-2023-8901`, `GC02…X9L4M`, `stellar:tx/4c8…f1a`.

Tabular numerals (`font-variant-numeric: tabular-nums`) for all financial figures.

### Spacing

8px base unit, multiples only (4 8 12 16 24 32 48 64). Outer page margin is **64px desktop / 32 tablet / 20 mobile**. Max content width **1440px**. Dark space (negative space) is functional — it separates concerns during high-stakes financial decisions. Never cramped.

### Radius

**Soft Level 1** — disciplined rounding. **`8px`** for cards. **`12px`** for primary dashboard containers and modals. **`4px`** is the default for buttons and inputs. **Pill shapes (`9999px`) are reserved for status dots and tag chips ONLY** — never for primary buttons.

### Backgrounds

- **Solid obsidian canvas** (`#0e141a`). No images, no full-bleed photos, no repeating patterns, no textures, no hand-drawn illustrations.
- **Ambient radial gradients** at very low opacity (8–18%) — used sparingly to anchor a hero card (`radial-gradient at top-right` for the Available Liquidity tile). Never as full-page wash.
- **No marketing gradients.** No purple/blue, no rainbow.

### Elevation & shadows

Depth is achieved through **glass + a 1px highlight on the top edge**, not heavy drop shadows.

- `--shadow-sm` (`0 1px 2px rgba(0,0,0,0.35)`) — inline cards.
- `--shadow-md` (`0 12px 40px rgba(0,0,0,0.45)`) — floating panels, modals.
- `--shadow-primary-glow` (`0 0 15px rgba(190,198,224,0.10)`) — soft halo on the brand mark and primary CTA.
- `--shadow-teal-glow` (`0 0 15px rgba(45,212,191,0.30)`) — *only* on live/pending/success indicators.

### Glass recipe

```css
background: rgba(20, 26, 36, 0.40);          /* container/40 */
backdrop-filter: blur(20px);                  /* heavy: sticky headers + sidebar */
-webkit-backdrop-filter: blur(20px);          /* light variant: 12px for cards */
border-top: 1px solid rgba(226,232,240,0.10); /* upward highlight */
border-radius: 12px;                          /* or 16px for primary containers */
```

The 1px top-edge highlight is the design system's signature detail — it makes cards feel lifted without resorting to drop shadows.

### Borders

- Default surface border is **`rgba(69, 70, 77, 0.20–0.60)`** — `outline-variant` at varying alpha.
- Glass surfaces get the **top-edge silver highlight** (`rgba(226,232,240,0.10)`) instead of a full perimeter border.
- Active states get a **soft silver bottom-rail** (sidebar) or **teal border** (active pipeline step, "Execute Atomic Swap" button).

### Motion

Calm. State-signaling only. Never decorative.

| Interaction | Duration | Easing |
|---|---|---|
| Button hover/active | `120ms` | `ease-out` |
| Default transition | `150ms` | `ease-out` |
| Modal open | `200ms` | `ease-out` (fade + 4px translate up) |
| Tab switch | `180ms` | `ease-in-out` |
| Blockchain pending | `2s` | `ease-in-out` — soft teal pulse |

Transitions over 400ms, looping decorative motion, or motion that does not signal a state change — **never**.

### Hover & press states

- **Hover (primary):** opacity 0.9 + slightly brighter (no scale).
- **Hover (secondary/ghost):** 5–20% surface-variant overlay fill.
- **Press:** `transform: scale(0.97)` for ~120ms. No color change.
- **Active row in a list/nav:** filled surface-variant background + 2px primary-colored right-edge rail.

### Transparency & blur

Used as a structural device, not decoration. Heavy blur (`20px`) on **sticky chrome** (sidebar, top bar). Light blur (`12px`) on **cards**. Plain solid surfaces (no blur) for **inputs and inline data**.

### Imagery vibe

Axial uses **no decorative imagery**. There are no stock photos, no illustrations, no avatar art. Where a portrait is needed, use a **monogram avatar** (the kit's `<Avatar />`) — initials over a subtle slate gradient.

### Cards

Two card archetypes:

1. **Glass card** — `surface-container/40` background + `backdrop-blur: 20px` + 1px top highlight. Default for dashboard surfaces. Border-radius `16px`.
2. **Inset surface** — `surface-container-low` + 1px `outline-variant/30` border. For nested panels inside a glass card (Regulatory Pulse rows, statutory split tiles).

Cards never get drop shadows; never get full perimeter highlight; never get colored left-border accents.

### Layout rules

- 12-column grid, 32px gutter.
- Sidebar is **fixed left, 256px**, glass-blurred, contains the brand lockup + "New Transaction" CTA + nav.
- Page header (top bar) is **sticky, full-bleed within the main column**, glass-blurred with the page title and wallet/notifications/avatar.
- Each main content area uses **`max-width: 1440px`** and centers within the column. Page margin **64px desktop**.

---

## Iconography

Axial uses **Material Symbols Outlined** exclusively. The font is loaded once from Google Fonts using variable axes:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap">
```

```css
.material-symbols-outlined {
  font-family: "Material Symbols Outlined", sans-serif;
  font-feature-settings: "liga";
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
}
.material-symbols-outlined.fill {
  font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24;
}
```

### Usage rules

- **Outlined (FILL 0)** for inactive / default icons.
- **Filled (FILL 1)** for active states — active sidebar route, "Synchronized" check, primary nav icon when selected.
- **Default size 20px** for inline UI · 16–18px for nested icons in chips · 24–36px for prominent feature icons.
- **Color follows the surrounding context.** Default `on-surface-variant`. Teal for live/success. Soft silver for primary CTAs.
- **Never mix icon systems.** No Lucide, Heroicons, Phosphor, or SVG one-offs.
- **No emoji. Ever.**
- **No PNG icons.** The brand mark (`assets/logos/axial-mark.svg`) is the only raster-free SVG glyph — and it's built on the "architecture" Material Symbol idea.

### Canonical icons (by surface)

| Surface | Icon |
|---|---|
| Brand mark | `architecture` |
| Sidebar — Command Center | `dashboard` |
| Sidebar — Liquidity | `swap_horiz` |
| Sidebar — Compliance | `gavel` |
| Sidebar — Settings | `settings_input_component` |
| Available Liquidity hero | `account_balance` |
| Regulatory Pulse — BIR sync | `cloud_done` |
| Regulatory Pulse — Statutory split | `call_split` |
| Operational Runway chart header | `monitoring` |
| Recent Actions — tokenization | `receipt_long` |
| Recent Actions — contract audit | `security` |
| Tokenization pipeline — verification | `document_scanner` |
| Tokenization pipeline — minting | `token` |
| Tokenization pipeline — matching | `balance` |
| Upload zone | `upload_file` |
| Wallet | `account_balance_wallet` |
| Notifications | `notifications` |
| BIR EIS accepted | `verified` |
| Compliance policy | `policy` |
| Settings — Statutory Splitter agencies | `account_balance` (SSS) · `security` (PhilHealth) · `home` (Pag-IBIG) |

---

## How to use this system

### Producing a slide deck or static page
Link `colors_and_type.css`, use the CSS variables and `.axl-*` helper classes. Pull components by *copying* the JSX from `ui_kits/axial-app/` and adapting — they're written as plain inline-style React, so they paste cleanly into any HTML+Babel setup.

### Producing a prototype
The kit in `ui_kits/axial-app/index.html` is a full click-through. Take it as the starting point — duplicate, rename, and modify. The four screens already wire up routing, the wallet toggle, the swap-execute interaction, and a calm toast on success.

### Producing production code (Next.js + Tailwind)
The `reference/` folder holds the original Stitch components from the upstream `prototype/` codebase. Use those — they're the canonical source. The Tailwind theme is in [`prototype/tailwind.config.ts`](https://github.com/Axon-Enjin/japan/blob/main/prototype/tailwind.config.ts) upstream.

---

## Caveats

- **Geist + Material Symbols** are loaded from Google Fonts CDN. The upstream prototype self-hosts Geist via `next/font` — match that pattern when deploying production assets.
- The brand SVG mark in `assets/logos/axial-mark.svg` is a simplified geometric stand-in built to match the Material Symbol "architecture" glyph used in the prototype's sidebar. **There is no official Axial logo file in the upstream repo** — request one from the team before public launch.
- The reference screen renders (`assets/screens/`) and Stitch React source (`reference/`) are the source of truth for the four core surfaces. If the prototype gains new surfaces (mobile, onboarding, wallet flow), this design system will need an extension.
- All Philippine financial nomenclature (TIN, SSS, PhilHealth, Pag-IBIG, BIR EIS, JWS, T+3, PDAX) is real and load-bearing. **Never substitute or "globalize" these terms** — the product positioning depends on Philippines-first specificity.
