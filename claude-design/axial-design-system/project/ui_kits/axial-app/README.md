# Axial UI Kit — Web App

Interactive, click-through recreation of the four canonical Axial product surfaces:

1. **Command Center** (Overview) — Available Liquidity hero, Regulatory Pulse, Operational Runway chart, Recent Actions.
2. **Liquidity Engine** — Invoice upload zone, Tokenization Pipeline, KPI tiles, Active Factoring table (with click-to-execute atomic swap).
3. **Compliance Ledger** — BIR EIS Connect, Filing Milestones, Statutory Splitter (SSS / PhilHealth / Pag-IBIG).
4. **Architectural Settings** — Government Agency Credentials, Stellar Wallet, Automation Logic toggles, System Audit Logs.

## Files

```
index.html       ← entry; loads React 18 + Babel + all .jsx files
primitives.jsx   ← Icon · Button · Card · CardHeader · StatusBadge · StatTile · Placeholder · Field · Toggle · Avatar
Sidebar.jsx      ← 256px fixed left rail with brand lockup, primary CTA, nav + footer items
TopBar.jsx       ← sticky page header (title + subtitle + wallet/notifications/avatar)
Overview.jsx     ← Command Center view (+ PulseRow)
Liquidity.jsx    ← Liquidity Engine view (+ UploadZone, Pipeline, PipelineStep)
Compliance.jsx   ← Compliance Ledger view (+ StatBlock, Milestone, SplitTile)
Settings.jsx     ← Architectural Settings view (+ AutomationCard)
App.jsx          ← route state + ReactDOM.createRoot()
```

## How it works

- **No router.** Route is held in `App.jsx` local state; clicking a `Sidebar` nav item swaps the rendered view.
- **No real backend.** Wallet connect toggles a local boolean. "Execute Atomic Swap" mutates a local list to `settled` and triggers a calm toast.
- **All styling is via CSS variables from `../../colors_and_type.css`** plus inline-style React. No CSS-in-JS library, no Tailwind. Components paste cleanly into any HTML+Babel setup.

## Extending

To add a new screen:

1. Add a route id to `NAV` in `Sidebar.jsx` and to `TITLES` in `App.jsx`.
2. Write a `<YourView>` component as a `.jsx` file, exporting via `window.YourView = YourView;` at the bottom.
3. Include the file in `index.html` (`<script type="text/babel" src="YourView.jsx"></script>`) before `App.jsx`.
4. Render it in `App.jsx` with `{route === 'your-id' && <YourView />}`.

## Limitations

This is a **cosmetic recreation**, not production code. No real Stellar transactions, no real BIR EIS API calls, no form validation, no error handling beyond visual states. For production, use the upstream Next.js codebase (`Axon-Enjin/axial`) and import its Tailwind theme.
