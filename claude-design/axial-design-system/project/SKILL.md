---
name: axial-design
description: Use this skill to generate well-branded interfaces and assets for Axial — a Philippines-first liquidity and compliance engine for MSMEs — either for production or throwaway prototypes/mocks/decks. Contains essential design guidelines, colors, type, fonts, assets, and a UI kit for prototyping.
user-invocable: true
---

# Axial Design Skill

Axial is a liquidity and compliance engine for Philippine MSMEs. The visual identity is dark-mode-first, glassmorphic, and architectural — institutional but not cold. Tagline: **"Instant capital, invisible compliance."**

## How to use this skill

1. **Read `README.md`** in the skill root. It contains the full content fundamentals, visual foundations, and iconography guides — every decision is there.
2. **Browse `preview/`** for visual specimens of every token, component, and brand element (~25 cards).
3. **Use `colors_and_type.css`** as the single source of truth for tokens. Link it via `<link rel="stylesheet">` and reference CSS variables (`var(--color-primary)`, `var(--font-sans)`, etc.) or the helper classes (`.axl-glass`, `.axl-h1`, `.material-symbols-outlined`).
4. **Pull components from `ui_kits/axial-app/`** — `primitives.jsx` has Icon, Button, Card, StatusBadge, StatTile, Field, Toggle, Avatar. The four screen files (`Overview.jsx`, `Liquidity.jsx`, `Compliance.jsx`, `Settings.jsx`) show full layouts you can copy from.
5. **Reference `assets/screens/`** for the canonical look of the four product surfaces.
6. **For production code**, `reference/` holds the original Next.js + Tailwind Stitch components from the upstream repo.

## What you're making

- **Visual artifacts** (slides, mocks, throwaway prototypes): copy `colors_and_type.css` and the relevant logos/assets out, write static HTML files for the user to view. Link Google Fonts for Geist + Material Symbols Outlined.
- **Production code**: copy the assets and read the rules to become an expert in designing with this brand. The upstream tailwind config in `web/tailwind.config.ts` is the authoritative implementation reference.

## Non-negotiables

- **Never use emoji.** Material Symbols Outlined is the only iconography. Use the variable `FILL 0→1` axis for active states.
- **Never use alarmist microcopy.** No URGENT, no all-caps status messages, no shame-driven language. See README *Content fundamentals*.
- **Never use pill-shaped primary buttons.** 8px radius rectangles only. Pills are reserved for status dots and tag chips.
- **Bioluminescent teal (`#2DD4BF`) is for live/active/pending blockchain/success ONLY.** Not a generic brand color.
- **Philippine financial nomenclature is load-bearing.** TIN, SSS, PhilHealth, Pag-IBIG, BIR EIS, JWS, T+3, PDAX — never substitute or globalize.
- **Settlement asset is USDC on Stellar. User-facing denomination is PHP (₱).** Show PHP in the UI; mention USDC only when relevant.
- **Numbers use tabular numerals.** `font-variant-numeric: tabular-nums;` on every financial figure.

## If the user invokes this skill without guidance

Ask what they want to build or design, ask a few clarifying questions (audience, fidelity, screen vs deck vs production), then act as an expert designer. Output HTML artifacts for visual work, or production code (Next.js + Tailwind + Material Symbols) for engineering work. Always show your starting assumptions early.
