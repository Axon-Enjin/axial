// Axial — Philippine Blockchain Week 2026 deck
// Native .pptx via pptxgenjs. Obsidian/teal palette per docs/dsd-axial.md.
// Narrative spine: The 5 Elements of a Brilliant Sales Narrative.
// Build:  node deck/axial-pbw.js   ->   deck/axial-pbw.pptx
const pptxgen = require("pptxgenjs");
const path = require("path");

// ---------- palette (Material 3 — obsidian primary, teal accent) ----------
const C = {
  DARK:  "0F172A", // obsidian canvas
  DARK2: "1E293B", // deep slate panel
  DARK3: "334155", // slate-700 border on dark
  TEAL:  "2DD4BF", // bioluminescent teal — active states only
  TEALT: "0D9488", // teal-600 — readable teal text on white
  WHITE: "FFFFFF",
  INK:   "0F172A", // text on light
  BODY:  "475569", // slate-600 body on light
  MUTED: "94A3B8", // slate-400 captions
  SILVER:"E2E8F0", // soft silver — text on dark
  ICE:   "CBD5E1", // slate-300 — muted text on dark
  PANEL: "F1F5F9", // slate-100 light card
  LINE:  "E2E8F0", // slate-200 border on light
};
const HF = "Segoe UI";        // header (Geist not guaranteed on venue machine)
const BF = "Segoe UI";        // body
const QR = path.join(__dirname, "..", "docs", "assets", "axial-axonenjin-qr.png");

const p = new pptxgen();
p.defineLayout({ name: "W", width: 13.333, height: 7.5 });
p.layout = "W";
p.author = "Axon Enjin";
p.company = "Axial";
p.title = "Axial — Philippine Blockchain Week 2026";
const W = 13.333, H = 7.5;
const sh = () => ({ type: "outer", color: "0F172A", blur: 10, offset: 3, angle: 90, opacity: 0.22 });

// ---------- helpers ----------
function ambient(s) {
  s.addShape(p.shapes.OVAL, { x: 10.2, y: -1.9, w: 5.4, h: 5.4, fill: { color: C.TEAL, transparency: 86 }, line: { type: "none" } });
  s.addShape(p.shapes.OVAL, { x: 11.7, y: 3.8, w: 3.4, h: 3.4, fill: { color: C.TEAL, transparency: 92 }, line: { type: "none" } });
}
function tag(s, x, y, label, fill = C.TEAL, fg = C.DARK) {
  const w = 0.22 + label.length * 0.083;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.34, fill: { color: fill }, line: { type: "none" }, rectRadius: 0.17 });
  s.addText(label, { x, y, w, h: 0.34, align: "center", valign: "middle", fontFace: HF, bold: true, color: fg, fontSize: 10, charSpacing: 1, margin: 0 });
}
function kicker(s, text, dark) {
  s.addText(text.toUpperCase(), { x: 0.6, y: 0.55, w: 11, h: 0.32, fontFace: HF, bold: true, color: dark ? C.TEAL : C.TEALT, fontSize: 12.5, charSpacing: 3, margin: 0 });
}
function title(s, text, dark, y = 0.95, size = 33) {
  s.addText(text, { x: 0.58, y, w: 12.1, h: 1.0, fontFace: HF, bold: true, color: dark ? C.WHITE : C.INK, fontSize: size, margin: 0 });
}
function lede(s, text, dark, y = 1.85) {
  s.addText(text, { x: 0.6, y, w: 12.0, h: 0.6, fontFace: BF, color: dark ? C.ICE : C.BODY, fontSize: 14.5, margin: 0 });
}
function footer(s, n, dark) {
  const col = dark ? C.ICE : C.MUTED;
  s.addText([{ text: "AXIAL", options: { bold: true, color: dark ? C.WHITE : C.INK } }, { text: "   ·   Axon Enjin", options: { color: col } }],
    { x: 0.6, y: H - 0.5, w: 6, h: 0.3, fontFace: HF, fontSize: 9.5, charSpacing: 1, valign: "middle", margin: 0 });
  s.addText(`Philippine Blockchain Week 2026   ·   ${n}/12`, { x: W - 5.2, y: H - 0.5, w: 4.6, h: 0.3, align: "right", fontFace: BF, fontSize: 9.5, color: col, valign: "middle", margin: 0 });
}
// card with optional left accent bar + heading + body
function card(s, x, y, w, h, opts) {
  const dark = opts.dark;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: dark ? C.DARK2 : C.WHITE }, line: { color: dark ? C.DARK3 : C.LINE, width: 1 }, rectRadius: 0.1, shadow: dark ? undefined : sh() });
}

// ============================================================ 1 — TITLE
let s = p.addSlide(); s.background = { color: C.DARK }; ambient(s);
s.addText("Axial", { x: 0.85, y: 2.35, w: 9, h: 1.3, fontFace: HF, bold: true, color: C.WHITE, fontSize: 66, margin: 0 });
s.addText("Instant Capital  ·  Effortless Compliance", { x: 0.9, y: 3.65, w: 11, h: 0.6, fontFace: HF, italic: true, color: C.TEAL, fontSize: 23, margin: 0 });
s.addText("A liquidity & compliance engine for Philippine MSMEs — on Stellar.", { x: 0.9, y: 4.35, w: 11, h: 0.5, fontFace: BF, color: C.ICE, fontSize: 15.5, margin: 0 });
tag(s, 0.92, 5.25, "PHILIPPINE BLOCKCHAIN WEEK 2026", C.TEAL, C.DARK);
tag(s, 6.05, 5.25, "LIVE ON STELLAR MAINNET", C.DARK2, C.WHITE);
s.addText("Team Axon Enjin  —  Carlos Jerico Dela Torre · Aidan Tiu · Gerald Berongoy · Rhandie Sales Jr.",
  { x: 0.92, y: 5.95, w: 11.5, h: 0.4, fontFace: BF, color: C.ICE, fontSize: 12, margin: 0 });

// ============================================================ 2 — THE CHANGE
s = p.addSlide(); s.background = { color: C.WHITE };
kicker(s, "The change in the world", false);
title(s, "Being a Filipino business is going real-time.");
lede(s, "Two facts of business life are ending at the same moment — capital and compliance are both becoming real-time.", false);

// two converging panels
const pcap = 0.85, pw = 5.55, py = 2.7, ph = 3.05;
s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: pcap, y: py, w: pw, h: ph, fill: { color: C.PANEL }, line: { color: C.LINE, width: 1 }, rectRadius: 0.1 });
s.addText("THE CASH GAP", { x: pcap + 0.35, y: py + 0.28, w: pw - 0.7, h: 0.3, fontFace: HF, bold: true, color: C.TEALT, fontSize: 12, charSpacing: 2, margin: 0 });
s.addText([{ text: "$221B", options: { bold: true, color: C.INK, fontSize: 40, breakLine: true } }, { text: "MSME funding demand  ·  vs  $15B  formal supply", options: { color: C.BODY, fontSize: 13 } }],
  { x: pcap + 0.35, y: py + 0.7, w: pw - 0.7, h: 1.1, fontFace: HF, margin: 0 });
s.addText("Enterprise buyers pay Net 60–90. Payroll runs every two weeks. The cash is always trapped in the gap.",
  { x: pcap + 0.35, y: py + 1.95, w: pw - 0.7, h: 0.9, fontFace: BF, color: C.BODY, fontSize: 12.5, margin: 0 });

const px2 = 6.95;
s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: px2, y: py, w: pw, h: ph, fill: { color: C.DARK }, line: { type: "none" }, rectRadius: 0.1, shadow: sh() });
s.addText("THE COMPLIANCE SHIFT", { x: px2 + 0.35, y: py + 0.28, w: pw - 0.7, h: 0.3, fontFace: HF, bold: true, color: C.TEAL, fontSize: 12, charSpacing: 2, margin: 0 });
s.addText([{ text: "Dec 31, 2026", options: { bold: true, color: C.WHITE, fontSize: 38, breakLine: true } }, { text: "BIR e-Invoicing (EIS) — RR 11-2025 & 26-2025", options: { color: C.ICE, fontSize: 13 } }],
  { x: px2 + 0.35, y: py + 0.7, w: pw - 0.7, h: 1.1, fontFace: HF, margin: 0 });
s.addText("Structured JSON invoices, digitally signed, transmitted within 3 days. Paper, audited-later, is over — the real-time tax wave is here.",
  { x: px2 + 0.35, y: py + 1.95, w: pw - 0.7, h: 0.9, fontFace: BF, color: C.ICE, fontSize: 12.5, margin: 0 });
footer(s, 2, false);

// ============================================================ 3 — WINNERS & LOSERS
s = p.addSlide(); s.background = { color: C.DARK }; ambient(s);
kicker(s, "Winners and losers", true);
title(s, "This change creates a fork.", true);

// winners card
s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 0.85, y: 2.15, w: 5.55, h: 2.5, fill: { color: C.DARK2 }, line: { color: C.TEAL, width: 1.5 }, rectRadius: 0.1 });
s.addText("WINNERS", { x: 1.15, y: 2.4, w: 5, h: 0.34, fontFace: HF, bold: true, color: C.TEAL, fontSize: 14, charSpacing: 2, margin: 0 });
s.addText([{ text: "Liquid + compliant + disciplined", options: { bold: true, color: C.WHITE, fontSize: 16, breakLine: true } },
  { text: "Funded. Kept inside enterprise supply chains. Free to scale.", options: { color: C.ICE, fontSize: 13 } }],
  { x: 1.15, y: 2.85, w: 4.9, h: 1.6, fontFace: HF, margin: 0, lineSpacingMultiple: 1.1 });

// losers card
s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 6.95, y: 2.15, w: 5.55, h: 2.5, fill: { color: C.DARK2 }, line: { color: C.DARK3, width: 1 }, rectRadius: 0.1 });
s.addText("LEFT BEHIND", { x: 7.25, y: 2.4, w: 5, h: 0.34, fontFace: HF, bold: true, color: C.MUTED, fontSize: 14, charSpacing: 2, margin: 0 });
s.addText([{ text: "Spreadsheet-bound + cash-starved", options: { bold: true, color: C.WHITE, fontSize: 16, breakLine: true } },
  { text: "Dropped from supply chains (buyers refuse paper), penalized by BIR, locked out of capital with no collateral.", options: { color: C.ICE, fontSize: 13 } }],
  { x: 7.25, y: 2.85, w: 4.9, h: 1.6, fontFace: HF, margin: 0, lineSpacingMultiple: 1.1 });

// cautionary strip
s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 0.85, y: 5.0, w: 11.65, h: 1.45, fill: { color: C.DARK2 }, line: { color: C.DARK3, width: 1 }, rectRadius: 0.1 });
s.addText([{ text: "And the undisciplined financiers blew up too.  ", options: { bold: true, color: C.WHITE, fontSize: 15 } },
  { text: "Greensill — a $10B collapse, financing invoices that weren't confirmed to exist. Goldfinch — default after default on-chain.", options: { color: C.ICE, fontSize: 13, breakLine: true } },
  { text: "The lesson the whole industry learned: blockchain doesn't fix credit risk — discipline does. The winners are the disciplined.", options: { color: C.TEAL, fontSize: 13, italic: true } }],
  { x: 1.15, y: 5.2, w: 11.1, h: 1.05, fontFace: BF, margin: 0, valign: "middle", lineSpacingMultiple: 1.15 });
footer(s, 3, true);

// ============================================================ 4 — PROMISED LAND
s = p.addSlide(); s.background = { color: C.WHITE };
kicker(s, "The promised land", false);
title(s, "Capital and compliance that just happen.");
lede(s, "Now imagine the other side of the change — a business where the friction simply disappears.", false);

const land = [
  ["Cash in minutes", "Invoice your client; the advance lands in minutes, not 60 days. No collateral."],
  ["Payroll, routed", "SSS, PhilHealth, and Pag-IBIG split automatically — correct, every cycle."],
  ["Filing, ready to approve", "Your BIR submission is prepared and waiting for one click. No midnight portals."],
  ["Back to building", "You're liquid, you're compliant, and you're free to do the actual work."],
];
let ly = 2.75;
land.forEach(([h, b]) => {
  s.addShape(p.shapes.RECTANGLE, { x: 0.85, y: ly + 0.04, w: 0.09, h: 0.78, fill: { color: C.TEAL }, line: { type: "none" } });
  s.addText(h, { x: 1.12, y: ly, w: 11, h: 0.4, fontFace: HF, bold: true, color: C.INK, fontSize: 17, margin: 0 });
  s.addText(b, { x: 1.12, y: ly + 0.42, w: 11.2, h: 0.44, fontFace: BF, color: C.BODY, fontSize: 13.5, margin: 0 });
  ly += 1.02;
});
footer(s, 4, false);

// ============================================================ 5 — HOW IT WORKS
s = p.addSlide(); s.background = { color: C.DARK }; ambient(s);
kicker(s, "How Axial works", true);
title(s, "One pipeline. Liquidity in, compliance out.", true);
lede(s, "Both halves turn on the same on-chain event — that's what makes them inseparable, not bolted together.", true);

const steps = [
  ["1", "Payer confirms", "Verified payer confirms the invoice + acknowledges assignment"],
  ["2", "Tokenize", "The confirmed receivable is minted on Soroban"],
  ["3", "Atomic swap", "Funder advances USDC — you see pesos in-app"],
  ["4", "Payroll split", "SSS / PhilHealth / Pag-IBIG routed in one transaction"],
  ["5", "Compliance", "BIR fields mapped, signed, queued for approval — proof on-ledger"],
];
let sx = 0.7; const sw = 2.32, sgap = 0.18;
steps.forEach(([n, h, b], i) => {
  const x = sx + i * (sw + sgap);
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 2.85, w: sw, h: 2.7, fill: { color: C.DARK2 }, line: { color: C.DARK3, width: 1 }, rectRadius: 0.1 });
  s.addShape(p.shapes.OVAL, { x: x + sw / 2 - 0.3, y: 3.1, w: 0.6, h: 0.6, fill: { color: C.TEAL }, line: { type: "none" } });
  s.addText(n, { x: x + sw / 2 - 0.3, y: 3.1, w: 0.6, h: 0.6, align: "center", valign: "middle", fontFace: HF, bold: true, color: C.DARK, fontSize: 18, margin: 0 });
  s.addText(h, { x: x + 0.12, y: 3.85, w: sw - 0.24, h: 0.4, align: "center", fontFace: HF, bold: true, color: C.WHITE, fontSize: 14.5, margin: 0 });
  s.addText(b, { x: x + 0.16, y: 4.28, w: sw - 0.32, h: 1.1, align: "center", fontFace: BF, color: C.ICE, fontSize: 11, margin: 0, lineSpacingMultiple: 1.05 });
  if (i < steps.length - 1) s.addText(">", { x: x + sw - 0.02, y: 3.95, w: sgap + 0.04, h: 0.4, align: "center", valign: "middle", fontFace: HF, bold: true, color: C.TEAL, fontSize: 16, margin: 0 });
});
s.addText("No spreadsheet in the middle.", { x: 0.6, y: 5.95, w: 12, h: 0.4, align: "center", fontFace: HF, italic: true, color: C.TEAL, fontSize: 14, margin: 0 });
footer(s, 5, true);

// ============================================================ 6 — GIFT 1: INSTANT CAPITAL
s = p.addSlide(); s.background = { color: C.DARK }; ambient(s);
kicker(s, "Magic gift 1 — instant capital", true);
title(s, "“How do I get cash now, without collateral?”", true, 0.95, 30);
lede(s, "Upload a confirmed invoice. We tokenize it and execute an atomic swap on Stellar.", true);

const g1 = [["≤ 85%", "of face value advanced"], ["Minutes", "not 60–90 days"], ["No collateral", "the receivable is the asset"]];
let gx = 0.85;
g1.forEach(([big, sub]) => {
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: gx, y: 2.95, w: 3.75, h: 2.05, fill: { color: C.DARK2 }, line: { color: C.DARK3, width: 1 }, rectRadius: 0.1 });
  s.addText(big, { x: gx + 0.2, y: 3.2, w: 3.35, h: 0.95, align: "center", fontFace: HF, bold: true, color: C.TEAL, fontSize: 36, margin: 0 });
  s.addText(sub, { x: gx + 0.2, y: 4.2, w: 3.35, h: 0.5, align: "center", fontFace: BF, color: C.ICE, fontSize: 13.5, margin: 0 });
  gx += 4.0;
});
s.addText("The interface shows pesos. Settlement runs on USDC underneath. That's the instant-capital half.",
  { x: 0.85, y: 5.35, w: 11.6, h: 0.5, fontFace: BF, color: C.ICE, fontSize: 13.5, margin: 0 });
footer(s, 6, true);

// ============================================================ 7 — GIFT 2: THE TRUST LOOP (the anti-fraud slide)
s = p.addSlide(); s.background = { color: C.WHITE };
kicker(s, "Magic gift 2 — the trust loop", false);
title(s, "“What if it's a scam? What if the company closes?”");
lede(s, "The right question — and our answer is structural, not a promise. A closed loop of four independent layers.", false);

const loop = [
  ["1 · Confirmed-invoice gate", "No funding unless the verified payer confirms the invoice. Kills fake & inflated invoices at the root."],
  ["2 · Notice of Assignment + lockbox", "Once acknowledged, paying anyone but the lockbox doesn't clear the debt (Civil Code). Kills redirection."],
  ["3 · Reserve + recourse", "Advance 85%, not 100%, with a holdback + recourse. If a business closes, the payer still repays the funder."],
  ["4 · Reconciliation", "Auto-freeze and escalate within days if a due invoice's lockbox stays empty. Leakage caught fast."],
];
let cx = 0.85, cy = 2.75; const cw = 5.7, ch2 = 1.55;
loop.forEach(([h, b], i) => {
  const x = cx + (i % 2) * (cw + 0.25), y = cy + Math.floor(i / 2) * (ch2 + 0.2);
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: ch2, fill: { color: C.PANEL }, line: { color: C.LINE, width: 1 }, rectRadius: 0.1 });
  s.addShape(p.shapes.RECTANGLE, { x, y, w: 0.1, h: ch2, fill: { color: C.TEAL }, line: { type: "none" } });
  s.addText(h, { x: x + 0.3, y: y + 0.2, w: cw - 0.5, h: 0.4, fontFace: HF, bold: true, color: C.INK, fontSize: 15, margin: 0 });
  s.addText(b, { x: x + 0.3, y: y + 0.62, w: cw - 0.55, h: 0.85, fontFace: BF, color: C.BODY, fontSize: 12.3, margin: 0, lineSpacingMultiple: 1.05 });
});
s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 0.85, y: 6.05, w: 11.65, h: 0.62, fill: { color: C.DARK }, line: { type: "none" }, rectRadius: 0.1 });
s.addText("We don't promise fraud is impossible. We make it expensive to attempt, contained when it happens, and caught fast.",
  { x: 0.85, y: 6.05, w: 11.65, h: 0.62, align: "center", valign: "middle", fontFace: HF, bold: true, color: C.WHITE, fontSize: 13, margin: 0 });
footer(s, 7, false);

// ============================================================ 8 — GIFT 3: COMPLIANCE CO-PILOT
s = p.addSlide(); s.background = { color: C.DARK }; ambient(s);
kicker(s, "Magic gift 3 — the compliance co-pilot", true);
title(s, "Effortless, not invisible. A person is always in the loop.", true, 0.95, 30);
lede(s, "We deliberately do NOT silently auto-file to the BIR. Axial prepares; you approve.", true);

const flow3 = [["Prepare", "Map the ledger event to the EIS 20-field schema; JWS-sign; build payroll splits"], ["Review", "The filing is surfaced for a human to check — the control that catches errors & fraud"], ["Submit", "One-click approval transmits within T+3; reference written to the Stellar memo"]];
let fx = 0.85;
flow3.forEach(([h, b], i) => {
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: fx, y: 2.95, w: 3.6, h: 2.15, fill: { color: C.DARK2 }, line: { color: C.DARK3, width: 1 }, rectRadius: 0.1 });
  s.addText(`${i + 1}`, { x: fx + 0.25, y: 3.12, w: 0.8, h: 0.6, fontFace: HF, bold: true, color: C.TEAL, fontSize: 26, margin: 0 });
  s.addText(h, { x: fx + 0.25, y: 3.72, w: 3.1, h: 0.4, fontFace: HF, bold: true, color: C.WHITE, fontSize: 17, margin: 0 });
  s.addText(b, { x: fx + 0.25, y: 4.16, w: 3.15, h: 0.85, fontFace: BF, color: C.ICE, fontSize: 12, margin: 0, lineSpacingMultiple: 1.05 });
  if (i < 2) s.addText(">", { x: fx + 3.62, y: 3.85, w: 0.36, h: 0.4, align: "center", valign: "middle", fontFace: HF, bold: true, color: C.TEAL, fontSize: 18, margin: 0 });
  fx += 3.98;
});
s.addText("Full auto-submission is on the roadmap — gated on BIR software certification + a Permit to Transmit. Until then, a human approves every filing.",
  { x: 0.85, y: 5.4, w: 11.6, h: 0.5, fontFace: BF, italic: true, color: C.ICE, fontSize: 12.5, margin: 0 });
footer(s, 8, true);

// ============================================================ 9 — GIFT 4: WHY STELLAR
s = p.addSlide(); s.background = { color: C.WHITE };
kicker(s, "Magic gift 4 — why Stellar", false);
title(s, "Speed, trust, and proof — at once.");
lede(s, "This problem needs all three in one rail. Stellar is the only one that delivers them in production.", false);

const why = [["Seconds", "to settle, for fractions of a cent"], ["Production USDC", "Circle-issued, on Mainnet — real money"], ["Verifiable trail", "an audit trail a buyer or regulator can check"]];
gx = 0.85;
why.forEach(([big, sub]) => {
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: gx, y: 2.85, w: 3.75, h: 2.0, fill: { color: C.PANEL }, line: { color: C.LINE, width: 1 }, rectRadius: 0.1 });
  s.addText(big, { x: gx + 0.2, y: 3.1, w: 3.35, h: 0.7, align: "center", fontFace: HF, bold: true, color: C.TEALT, fontSize: 24, margin: 0 });
  s.addText(sub, { x: gx + 0.25, y: 3.85, w: 3.25, h: 0.85, align: "center", fontFace: BF, color: C.BODY, fontSize: 13, margin: 0, lineSpacingMultiple: 1.05 });
  gx += 4.0;
});
s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 0.85, y: 5.25, w: 11.65, h: 0.7, fill: { color: C.DARK }, line: { type: "none" }, rectRadius: 0.1 });
s.addText("The chain is the rails and the proof — not the underwriter. Discipline is. (That's the Goldfinch lesson, built in.)",
  { x: 0.85, y: 5.25, w: 11.65, h: 0.7, align: "center", valign: "middle", fontFace: HF, bold: true, color: C.WHITE, fontSize: 13.5, margin: 0 });
footer(s, 9, false);

// ============================================================ 10 — EVIDENCE / DEMO
s = p.addSlide(); s.background = { color: C.DARK }; ambient(s);
kicker(s, "Evidence — can we make it real?", true);
title(s, "We didn't write a deck and stop. We built it — in 7 days.", true, 0.95, 29);

const ev = [
  "4 Soroban contracts LIVE on Stellar Mainnet — mint · swap · payroll split · settlement",
  "Real USDC atomic swap  ·  payer portal with NoA + lockbox funding",
  "EIS Co-Pilot preparing JWS-signed payloads, reference written to the ledger memo",
  "2nd Runner-Up — Build on Stellar Philippines Hackathon 2026",
];
let ey = 2.45;
ev.forEach((t) => {
  s.addShape(p.shapes.OVAL, { x: 0.9, y: ey + 0.05, w: 0.2, h: 0.2, fill: { color: C.TEAL }, line: { type: "none" } });
  s.addText(t, { x: 1.3, y: ey - 0.06, w: 8.0, h: 0.45, fontFace: BF, color: C.SILVER, fontSize: 13.5, margin: 0 });
  ey += 0.62;
});
tag(s, 0.9, 5.15, "LIVE DEMO — OR THE 90-SECOND RECORDED RUN", C.TEAL, C.DARK);
s.addText("Overview → Liquidity (confirm → tokenize → swap → pesos) → Compliance (payroll + EIS prepared → approve → memo).",
  { x: 0.9, y: 5.65, w: 9.0, h: 0.7, fontFace: BF, italic: true, color: C.ICE, fontSize: 12, margin: 0 });
// QR
s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 10.35, y: 2.5, w: 2.35, h: 2.35, fill: { color: C.WHITE }, line: { type: "none" }, rectRadius: 0.08, shadow: sh() });
try { s.addImage({ path: QR, x: 10.55, y: 2.7, w: 1.95, h: 1.95 }); } catch (e) {}
s.addText("axial.axonenjin.com", { x: 10.1, y: 4.95, w: 2.85, h: 0.35, align: "center", fontFace: HF, bold: true, color: C.TEAL, fontSize: 12, margin: 0 });
footer(s, 10, true);

// ============================================================ 11 — ROADMAP & MODEL
s = p.addSlide(); s.background = { color: C.WHITE };
kicker(s, "Honest roadmap & model", false);
title(s, "Where we are — and how it pays.");

// live column
s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 0.85, y: 2.2, w: 5.7, h: 2.55, fill: { color: C.PANEL }, line: { color: C.TEAL, width: 1.5 }, rectRadius: 0.1 });
s.addText("LIVE NOW", { x: 1.15, y: 2.42, w: 5, h: 0.32, fontFace: HF, bold: true, color: C.TEALT, fontSize: 12.5, charSpacing: 2, margin: 0 });
s.addText([{ text: "• 4 contracts on Mainnet + real USDC swap", options: { breakLine: true } },
  { text: "• Closed-loop payer portal (NoA + lockbox)", options: { breakLine: true } },
  { text: "• Compliance Co-Pilot — prepare & review", options: {} }],
  { x: 1.15, y: 2.85, w: 5.2, h: 1.8, fontFace: BF, color: C.BODY, fontSize: 13, margin: 0, lineSpacingMultiple: 1.25 });

// next column
s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 6.8, y: 2.2, w: 5.7, h: 2.55, fill: { color: C.WHITE }, line: { color: C.LINE, width: 1 }, rectRadius: 0.1, shadow: sh() });
s.addText("NEXT", { x: 7.1, y: 2.42, w: 5, h: 0.32, fontFace: HF, bold: true, color: C.MUTED, fontSize: 12.5, charSpacing: 2, margin: 0 });
s.addText([{ text: "• Final on-chain settlement leg", options: { breakLine: true } },
  { text: "• BIR certification + Permit to Transmit", options: { breakLine: true } },
  { text: "• Regulated, qualified liquidity partners", options: {} }],
  { x: 7.1, y: 2.85, w: 5.2, h: 1.8, fontFace: BF, color: C.BODY, fontSize: 13, margin: 0, lineSpacingMultiple: 1.25 });

// model strip
s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 0.85, y: 5.05, w: 11.65, h: 1.4, fill: { color: C.DARK }, line: { type: "none" }, rectRadius: 0.1 });
s.addText("TWO ENGINES", { x: 1.15, y: 5.25, w: 4, h: 0.3, fontFace: HF, bold: true, color: C.TEAL, fontSize: 11.5, charSpacing: 2, margin: 0 });
s.addText([{ text: "A thin spread on every peso we unlock — below traditional factoring.", options: { color: C.SILVER, fontSize: 13.5, breakLine: true } },
  { text: "A recurring compliance subscription — for every business the Dec-2026 mandate is about to catch. Volume + a deadline.", options: { color: C.ICE, fontSize: 13.5 } }],
  { x: 1.15, y: 5.6, w: 11.1, h: 0.75, fontFace: BF, margin: 0, lineSpacingMultiple: 1.1 });
footer(s, 11, false);

// ============================================================ 12 — TEAM & CLOSE
s = p.addSlide(); s.background = { color: C.DARK }; ambient(s);
s.addShape(p.shapes.OVAL, { x: -1.8, y: 4.6, w: 5, h: 5, fill: { color: C.TEAL, transparency: 88 }, line: { type: "none" } });
kicker(s, "The change is here", true);
s.addText("Instant Capital.\nEffortless Compliance.", { x: 0.58, y: 1.4, w: 12, h: 1.8, fontFace: HF, bold: true, color: C.WHITE, fontSize: 40, margin: 0, lineSpacingMultiple: 1.0 });
s.addText("Filipino businesses shouldn't have to choose between making payroll and staying on the right side of the BIR. That's the axis we built Axial on.",
  { x: 0.6, y: 3.5, w: 11.5, h: 0.9, fontFace: BF, color: C.ICE, fontSize: 15, margin: 0, lineSpacingMultiple: 1.15 });
tag(s, 0.6, 4.65, "TEAM AXON ENJIN", C.TEAL, C.DARK);
s.addText("Carlos Jerico Dela Torre  ·  Aidan Tiu  ·  Gerald Berongoy  ·  Rhandie Sales Jr.",
  { x: 0.62, y: 5.2, w: 9, h: 0.4, fontFace: HF, bold: true, color: C.WHITE, fontSize: 14, margin: 0 });
s.addText("Polytechnic University of the Philippines", { x: 0.62, y: 5.6, w: 9, h: 0.35, fontFace: BF, color: C.ICE, fontSize: 12, margin: 0 });
s.addText("axial.axonenjin.com", { x: 0.62, y: 6.2, w: 9, h: 0.5, fontFace: HF, bold: true, color: C.TEAL, fontSize: 20, margin: 0 });
// QR
s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 10.35, y: 4.75, w: 2.3, h: 2.3, fill: { color: C.WHITE }, line: { type: "none" }, rectRadius: 0.08, shadow: sh() });
try { s.addImage({ path: QR, x: 10.55, y: 4.95, w: 1.9, h: 1.9 }); } catch (e) {}

p.writeFile({ fileName: path.join(__dirname, "axial-pbw.pptx") }).then((f) => console.log("OK wrote", f));
