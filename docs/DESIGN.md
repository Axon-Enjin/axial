---
name: Architectural Transparency
colors:
  surface: '#0e141a'
  surface-dim: '#0e141a'
  surface-bright: '#333a40'
  surface-container-lowest: '#080f14'
  surface-container-low: '#161c22'
  surface-container: '#1a2026'
  surface-container-high: '#242b31'
  surface-container-highest: '#2f353c'
  on-surface: '#dde3eb'
  on-surface-variant: '#c6c6cd'
  inverse-surface: '#dde3eb'
  inverse-on-surface: '#2b3137'
  outline: '#909097'
  outline-variant: '#45464d'
  surface-tint: '#bec6e0'
  primary: '#bec6e0'
  on-primary: '#283044'
  primary-container: '#0f172a'
  on-primary-container: '#798098'
  inverse-primary: '#565e74'
  secondary: '#bcc7de'
  on-secondary: '#263143'
  secondary-container: '#3e495d'
  on-secondary-container: '#aeb9d0'
  tertiary: '#dec29a'
  on-tertiary: '#3e2d11'
  tertiary-container: '#231500'
  on-tertiary-container: '#957d5a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#0e141a'
  on-background: '#dde3eb'
  surface-variant: '#2f353c'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 32px
  margin-desktop: 64px
  margin-tablet: 32px
  margin-mobile: 20px
---

## Brand & Style

This design system is built upon the archetype of **The Architect**: a persona defined by meticulous precision, structural integrity, and autonomous scalability. It is designed for a high-fidelity financial environment where complexity is distilled into a calm, "unrushed" experience. 

The visual narrative merges **Minimalism** with high-end **Glassmorphism**. By utilizing frosted surfaces and deep-toned gradients, the UI mirrors the concept of blockchain transparency—visible yet secure. The experience should feel institutional but modern, moving away from legacy banking clutter toward a breathable, expansive workspace. Every element is intentional, conveying a sense of "Invisible Compliance" where the system works perfectly in the background so the user can focus on strategic growth.

## Colors

The palette is anchored in **Obsidian (#0F172A)** and **Deep Slate (#1E293B)** to provide a sophisticated, low-strain canvas for long-form financial analysis. These deep tones allow for an expansive sense of depth when layered with glass effects.

**Bioluminescent Teal (#2DD4BF)** serves as the primary action color, specifically reserved for active states, successful transactions, and "living" data like active currency swaps. **Soft Silver (#E2E8F0)** provides a high-contrast yet gentle metadata color, ensuring that technical details are legible without competing with the primary actions. Use transparency levels (10%, 20%, 40%) of Soft Silver for borders and secondary text to maintain the meticulous hierarchy.

## Typography

This design system utilizes **Geist** for its technical precision and developer-centric clarity. It bridges the gap between a monospaced aesthetic and a professional sans-serif, making it ideal for financial data and blockchain-related interfaces.

The type hierarchy prioritizes "Breathing Room" through generous line heights and slightly condensed tracking in headlines. Metadata and technical labels should utilize the `label-sm` style with increased letter spacing to evoke a sense of meticulously organized documentation. Avoid heavy weights unless necessary for critical financial figures; let the structure of the layout carry the emphasis.

## Layout & Spacing

The layout philosophy follows a **Fixed-Width Grid** within a fluid container to ensure that dashboards remain legible on ultra-wide monitors without stretching data points excessively. 

A 12-column grid is standard for desktop, but the defining characteristic is the **expansive margin and gutter system**. By using 32px gutters and 64px outer margins, the UI avoids the "cramped" feeling typical of financial software. White space (or "Dark Space" in this context) is treated as a functional element that separates concerns and reduces cognitive load during high-stakes decision-making. On mobile, the grid collapses to 4 columns with 20px margins, prioritizing vertical flow and modular cards.

## Elevation & Depth

Depth in this design system is achieved through **Glassmorphism and Layered Transparency** rather than traditional drop shadows.

1.  **Base Layer:** The Obsidian (#0F172A) canvas.
2.  **Surface Layer:** Deep Slate (#1E293B) at 40-60% opacity with a `backdrop-filter: blur(20px)`.
3.  **Accent Layer:** Subtle 1px borders using Soft Silver (#E2E8F0) at 10% opacity to define card edges.
4.  **Interaction Layer:** Bioluminescent Teal (#2DD4BF) glows. Use soft, diffused outer glows (box-shadow: 0 0 15px rgba(45, 212, 191, 0.3)) to indicate active states or successful validations.

This "stacked" approach allows the user to feel the hierarchy of information through visual density and clarity. Higher-priority elements appear more "transparent" and closer to the user, while background elements feel more opaque and recessed.

## Shapes

The shape language is **Soft (Level 1)**, leaning toward a technical and architectural feel. 

While rounded corners are used to soften the dark-mode experience, they remain disciplined. Standard containers use a 0.25rem (4px) radius to maintain a crisp, professional edge. Larger cards and primary dashboard containers may use a 0.5rem (8px) radius to distinguish them from smaller UI components. Avoid "Pill" shapes for buttons; instead, use slightly rounded rectangles to maintain the grid-based, structural integrity of the "Architect" archetype.

## Components

**Buttons:** 
Primary buttons are solid Bioluminescent Teal with dark text for maximum contrast. Secondary buttons should be "Ghost" style with a Soft Silver 1px border and subtle 5% fill on hover.

**Cards:** 
Cards are the core of this design system. They must feature a frosted glass effect (backdrop-blur) and a subtle 1px top-down gradient border. This mimics the look of high-end architectural glass and reinforces the transparency value.

**Inputs:** 
Financial inputs must be minimal. Use a bottom-border-only approach for inactive states, transitioning to a full Soft Silver border when focused. Error states use the functional red with a very subtle red "underglow."

**Success States & Swaps:** 
When a transaction or swap is active, the component should emit a soft Teal glow. Use a "pulse" animation for pending blockchain states to provide feedback without visual noise.

**Data Tables:** 
Rows should have no vertical borders. Use subtle horizontal dividers in Soft Silver (10% opacity). The header row should be in `label-sm` typography for a professional, institutional look.