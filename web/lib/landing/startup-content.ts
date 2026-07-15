/** Investor / partner landing copy — product-to-startup posture (no competition framing). */

export const NAV_LINKS = [
  { href: "#problem", label: "Problem" },
  { href: "#product", label: "Product" },
  { href: "#feasibility", label: "Feasibility" },
  { href: "#economics", label: "Economics" },
  { href: "#canvas", label: "Canvas" },
  { href: "#team", label: "Team" },
] as const;

export const STEPS = [
  {
    n: "01",
    title: "Payer confirms invoice",
    body: "B2B payer verifies the receivable and acknowledges the Notice of Assignment.",
    trigger: "Invoice issued",
    logic: "KYB + confirm",
    action: "NoA acknowledged",
  },
  {
    n: "02",
    title: "Tokenize the receivable",
    body: "Axial mints a Stellar Asset Contract representing the verified receivable.",
    trigger: "Fundable status",
    logic: "One mint per invoice",
    action: "SAC on Mainnet",
  },
  {
    n: "03",
    title: "Receive USDC advance",
    body: "An atomic swap delivers ~85% of face value in USDC — shown in pesos in the app.",
    trigger: "Mint complete",
    logic: "85% advance bps",
    action: "USDC to wallet",
  },
  {
    n: "04",
    title: "Route statutory payroll",
    body: "One Soroban transaction splits SSS, PhilHealth, and Pag-IBIG on-chain.",
    trigger: "Payroll run",
    logic: "Statutory brackets",
    action: "Agency wallets funded",
  },
  {
    n: "05",
    title: "BIR EIS, ready to submit",
    body: "Oracle maps 20 BIR fields and JWS-signs — you review and approve within T+3.",
    trigger: "Ledger final",
    logic: "Map + JWS",
    action: "Human approve",
  },
] as const;

export const FEASIBILITY_ROWS = [
  {
    dim: "Product / tech",
    rating: "High",
    note: "Four Soroban contracts on Mainnet; mint, swap, payroll, lockbox funding live.",
  },
  {
    dim: "Regulatory path",
    rating: "Medium",
    note: "Compliance Co-Pilot now; live BIR transmission gated on certification + PTT.",
  },
  {
    dim: "Unit economics",
    rating: "High",
    note: "Dual engine: ~1% platform spread on face + recurring compliance SaaS.",
  },
  {
    dim: "Go-to-market",
    rating: "Medium",
    note: "Clear agency wedge; enterprise payer onboarding is the deliberate slow gate.",
  },
  {
    dim: "Capital",
    rating: "Medium",
    note: "Regulated / qualified liquidity partners — not an open underwriting-free pool.",
  },
] as const;

export const ECONOMICS_ENGINE_A = [
  { label: "Face (example)", value: "₱100,000" },
  { label: "Advance (85%)", value: "₱85,000" },
  { label: "Platform take (~1% face)", value: "₱1,000" },
  { label: "Funder yield (from discount)", value: "Risk capital share" },
] as const;

export const ECONOMICS_ENGINE_B = [
  { tier: "Starter", price: "₱2,500 / mo", includes: "EIS prep, statutory schedules, ≤50 invoices" },
  { tier: "Growth", price: "₱7,500 / mo", includes: "Higher volume, payroll router, priority support" },
  { tier: "Scale", price: "₱20,000+ / mo", includes: "Multi-entity, SLA, custom liquidity" },
] as const;

export const CANVAS = [
  {
    title: "Problem",
    body: "Net 60–90 traps cash while payroll is bi-weekly. BIR EIS (T+3, Dec 2026) and statutory payroll still run on spreadsheets. Traditional factoring is slow and collateral-heavy.",
  },
  {
    title: "Segments",
    body: "Primary: 10–50 person PH B2B agencies. Secondary: F&B distributors. Capital: licensed financing partners. Payers: enterprise buyers who confirm + ack NoA.",
  },
  {
    title: "UVP",
    body: "Instant Capital, Effortless Compliance — ~85% of a confirmed receivable in minutes, with EIS and statutory splits prepared for one-click human approval.",
  },
  {
    title: "Solution",
    body: "Closed-loop confirmed-invoice financing on Stellar: confirm → NoA → mint → USDC advance → payroll split → EIS Co-Pilot → lockbox settle.",
  },
  {
    title: "Channels",
    body: "White-glove founder pilots, product site, Stellar/fintech intros, payer-led supply-chain wedges, EIS-deadline urgency content.",
  },
  {
    title: "Revenue",
    body: "0.5–1.5% platform spread per funded face + tiered compliance SaaS. Optional FX edge and micro origination fees.",
  },
  {
    title: "Costs",
    body: "Engineering, Cloud Run/Supabase, counsel/KYB, partner yield (pass-through), Co-Pilot support, custody upgrades.",
  },
  {
    title: "Metrics",
    body: "Time-to-liquidity, % fundable only after payer+NoA, EIS within T+3, settle/leakage rate, SaaS NR, financed face PHP.",
  },
  {
    title: "Advantage",
    body: "Domain Soroban contracts already on Mainnet plus PH-native EIS + statutory oracle on one pipeline — closed-loop discipline, not open DeFi credit.",
  },
] as const;

export const LIVE_NOW = [
  "Receivable mint + USDC atomic swap on Stellar Mainnet",
  "Payroll split to SSS / PhilHealth / Pag-IBIG",
  "Payer portal, NoA, eligibility gate before funding",
  "EIS oracle → review-ready filing (mock BIR today)",
  "Lockbox funding via Freighter",
] as const;

export const NEXT_UP = [
  "On-chain settle with lockbox balance pre-check",
  "Funder Protection Center (book + diligence)",
  "Real payer KYB + BIR Permit to Transmit",
  "Licensed financing partner for production capital",
] as const;

export const TEAM = [
  {
    name: "Carlos Jerico Dela Torre",
    role: "Product & Business Architect",
    tag: "Founder",
    img: "/pics/DelaTorre.webp",
  },
  {
    name: "Aidan Tiu",
    role: "DevOps Engineer",
    img: "/pics/Tiu.webp",
  },
  {
    name: "Gerald Berongoy",
    role: "Full Stack Engineer",
    img: "/pics/Berongoy.webp",
  },
  {
    name: "Rhandie Sales Jr.",
    role: "Full Stack Engineer",
    img: "/pics/Sales.webp",
  },
] as const;
