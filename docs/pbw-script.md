# Axial — Philippine Blockchain Week Script (~10 min + demo)

**Event:** Philippine Blockchain Week 2026 · Day 1 · SMX · 2:30–3:45 PM block
**Slot:** 15 minutes per team → **~10-min narrative + ~3-min live demo + ~2-min Q&A/buffer**
**Slide-synced to:** the PBW deck (`deck/axial-pbw.pptx`, 12 slides). Advance at each `[advance]`.
**Audience:** fintech operators, investors, Stellar ecosystem, and regulators — **this is an industry talk, not a hackathon pitch.** The hackathon win is *evidence* (Element 5), not the headline.

**Narrative spine — [The 5 Elements of a Brilliant Sales Narrative](https://medium.com/the-mission/the-greatest-sales-deck-ive-ever-seen-4f4ef3391ba0):**

| # | Element | Slides | Beat |
|---|---------|--------|------|
| 1 | Name a big, relevant change in the world | 2 | PH business is going *real-time* — capital and compliance at once |
| 2 | Show there'll be winners and losers | 3 | Liquid + compliant win; spreadsheet-bound get excluded — and undisciplined financiers blow up |
| 3 | Tease the promised land | 4–5 | Capital and compliance that just *happen* |
| 4 | Features as "magic gifts" to beat the obstacles | 6–9 | Instant capital · the trust/anti-fraud loop · the Compliance Co-Pilot · why Stellar |
| 5 | Evidence you can make the story come true | 10–12 | Live on Mainnet · the win · honest roadmap · the team |

**Delivery notes:** Calm, assured — the brand is *The Architect*, never alarmist. Lead with outcomes. Pause after the numbers. The trust slide (7) is the one the judges challenged last time — slow down and own it.

---

## [SLIDE 1 — Title] (~30s)

Good afternoon. I'm Carlos, from Axon Enjin.

Quick question to start: how many of you run a business — or know one — that is *profitable on paper* and still sweating to make payroll?

Keep that person in mind. Everything I'm about to show you is for them.

This is **Axial** — *Instant Capital, Effortless Compliance.*

[advance]

---

## [SLIDE 2 — The Change] (~1.5 min) · *Element 1: a big, relevant change*

For decades, being a B2B business in the Philippines meant living with two facts of life.

One: your enterprise clients pay you in 60 to 90 days — but your people get paid every two weeks, and the government every month. Your cash is always trapped in the gap.

Two: compliance was paper. Manual invoices. Manual filing. Slow enough that nobody could see inside your business in real time.

**Both of those facts are ending at the same time — right now, in 2026.**

On the capital side: a whole generation of digital, fast-growing Filipino businesses is hitting that cash gap harder than ever. Visa puts MSME funding demand at **two hundred twenty-one billion dollars** — against a formal supply of just **fifteen**.

And on the compliance side: the BIR is moving the entire country from *paper, audited later* to *structured, electronic, reported almost immediately.* The Electronic Invoicing System — Revenue Regulations 11 and 26 of 2025 — JSON invoices, digitally signed, transmitted within three days. The deadline is **December 31, 2026.** This is the same real-time tax wave that already swept Latin America. It is now here.

So here's the change: **being a Filipino business is going real-time.** Real-time capital, real-time compliance. The paper era is over — whether you're ready or not.

[advance]

---

## [SLIDE 3 — Winners & Losers] (~1.5 min) · *Element 2: winners and losers*

And whenever the rules change like this, there are winners and there are losers.

The **winners** will be the businesses that are *both* liquid and verifiably compliant. They get funded. They stay inside enterprise supply chains — because compliant corporate buyers will simply stop accepting paper from anyone who isn't on EIS. They scale.

The **losers** will be the businesses still living on spreadsheets and 60-day gaps. They get squeezed out of the supply chain, penalized by the BIR, and locked out of capital — because they have no hard collateral to borrow against.

But here's the part most people miss. There are losers on the *other* side too — among the people who tried to close this gap the wrong way.

**Greensill Capital** built a ten-billion-dollar empire financing receivables — and collapsed, because it lent against invoices that *weren't confirmed to even exist.* On-chain, **Goldfinch** lent to real-world businesses and took default after default. The lesson the whole industry learned the hard way: *blockchain doesn't fix credit risk. Discipline does.*

So the winners aren't just the liquid and the compliant. They're the **disciplined.** Hold that thought — it's the core of how we built Axial.

[advance]

---

## [SLIDE 4 — The Promised Land] (~1 min) · *Element 3: tease the promised land*

Now imagine the other side of this change. Imagine a Filipino business where capital and compliance just… happen.

You invoice your client. The cash is in your account in **minutes** — not 60 days. No collateral.

Payroll splits to SSS, PhilHealth, and Pag-IBIG — correct, automatic.

Your BIR filing is **prepared and waiting** for a single click of your approval. You never open a government portal at midnight again.

You're liquid. You're compliant. And you're back to doing the only thing that actually grows your business — the work.

That's the promised land. **Instant capital. Effortless compliance.** Let me show you how a business gets there.

[advance]

---

## [SLIDE 5 — How Axial Works] (~1 min)

Axial is one pipeline. Liquidity flows in. Compliance flows out. Both turn on the *same* on-chain event — that's what makes them inseparable instead of two products bolted together.

Five steps. Your payer confirms the invoice and acknowledges it's assigned to us. The receivable is tokenized on Stellar. A funder advances USDC — and you see pesos in the app. Payroll splits in one transaction. And the moment money moves, compliance follows: the BIR fields are mapped, signed, and queued for your approval — with proof written to the ledger.

No spreadsheet in the middle. Now — the four things that make this actually work. I call them the magic gifts, because each one slays a specific dragon standing between you and that promised land.

[advance]

---

## [SLIDE 6 — Magic Gift 1: Instant Capital] (~45s) · *Element 4: magic gifts begin*

**Dragon one: "How do I get cash now, without collateral?"**

You upload a confirmed invoice. We tokenize it on Soroban and execute an atomic swap — your receivable for **USDC, up to 85% of face value, in minutes.** No collateral, no two-week underwriting. The interface shows pesos; the settlement is in stablecoin underneath. That's the *instant capital* half.

[advance]

---

## [SLIDE 7 — Magic Gift 2: The Trust Loop] (~1.5 min) · **the anti-fraud beat — slow down**

**Dragon two — and this is the big one. "How does anyone trust this? What if the business is a scam? What if it closes? What if the invoice is fake?"**

This is exactly the question we got asked, and it's the right question. Here's our answer — and it's structural, not a promise.

Axial is a **closed loop** with four independent layers:

One — **nothing gets funded unless the payer is verified and confirms the invoice.** No confirmation, no money. That kills fake and inflated invoices at the root — the exact thing that sank Greensill.

Two — a **Notice of Assignment.** Once the payer acknowledges it, under the Civil Code, paying anyone *but* our lockbox doesn't clear their debt. That kills payment redirection.

Three — we advance **85%, not 100%, with a holdback reserve and recourse.** So if a business closes, the funder is repaid by the *payer who owes the money* — not left holding the loss.

Four — a **reconciliation engine** that freezes and escalates within days if a due invoice isn't paid into the lockbox. Leakage is caught fast, not discovered at year-end.

Four financial layers. We don't claim fraud is impossible. We make it **expensive to attempt, contained when it happens, and caught fast.** *That* is what makes a funder willing to fund.

[advance]

---

## [SLIDE 8 — Magic Gift 3: The Compliance Co-Pilot] (~1 min)

**Dragon three: "How do I stay compliant without drowning — or worse, filing something wrong to the government?"**

This is where we made a deliberate, important choice. We do **not** silently auto-file to the BIR. We built a **Compliance Co-Pilot**: Axial *prepares* the EIS-ready invoice and the statutory payroll schedules, signs them, and puts them in front of a human to **review and approve in one click.**

That human checkpoint is not a limitation — it's the feature. It's what catches an OCR slip or a fraudulent invoice *before* it ever reaches the government. Full automation is on our roadmap, but only once we're BIR-certified with a Permit to Transmit. Until then, *effortless* — not invisible. A person is always in the loop.

[advance]

---

## [SLIDE 9 — Magic Gift 4: Why Stellar] (~45s)

**Dragon four: "Why blockchain at all?"**

Because this problem needs three things at once: speed, trust, and proof. Stellar settles in **seconds**, for **fractions of a cent**, in **production USDC** issued by Circle. And every step leaves an audit trail a corporate buyer — or a regulator — can verify independently.

To be clear about our role: the chain is the **rails and the proof.** It is not the underwriter. The discipline is. That's the Goldfinch lesson, built in from day one.

[advance]

---

## [SLIDE 10 — Evidence / Live Demo] (~2 min) · *Element 5: evidence*

So — can we actually make this story come true? We didn't write a deck and stop. **We built it. In seven days.**

Four Soroban contracts are **live on Stellar Mainnet** right now — mint, swap, payroll split, and settlement. Real USDC. A working payer portal with Notice-of-Assignment acknowledgement and lockbox funding. And the EIS Co-Pilot, preparing signed payloads with the reference written back to the ledger.

> **[LIVE DEMO — ~90s. If anything stalls, cut to the recorded video immediately.]**
> 1. Overview — treasury balance, on Mainnet.
> 2. Liquidity — a confirmed invoice → tokenize → atomic swap → pesos land.
> 3. Compliance — payroll split + the EIS filing *prepared and waiting for approval* → approve → memo reference on-chain.

Not a mockup. Not testnet. Mainnet. And this work was named **2nd Runner-Up at the Build on Stellar Philippines Hackathon** — validated by Stellar and the ecosystem itself.

[advance]

---

## [SLIDE 11 — Honest Roadmap & Model] (~1 min)

I want to be straight about what's live and what's next — because an audience like this can tell the difference, and the change we're talking about deserves honesty.

**Live:** the contracts, the swap, the closed-loop portal, the compliance preparation.
**Next:** the final on-chain settlement leg, BIR certification and the Permit to Transmit, and signed agreements with **regulated, qualified liquidity partners** — because factoring is a licensed financing activity here, and we're building it the right way, not the fast way.

And we make money two ways: a **thin spread** on every peso we unlock — below traditional factoring — and a **recurring compliance subscription**, for every business the December 2026 mandate is about to catch. Volume plus a deadline the whole market is racing toward.

[advance]

---

## [SLIDE 12 — Team & Close] (~45s)

Axial is built by **Axon Enjin** — four engineers from the Polytechnic University of the Philippines who just like to ship.

The change is already here. Capital and compliance are both going real-time. The winners will be the businesses that are liquid, compliant, and disciplined — and they shouldn't have to choose between making payroll and staying on the right side of the BIR.

That's the axis we built Axial on. **Instant capital. Effortless compliance.**

Come find us — **axial.axonenjin.com.** Thank you.

[advance — hold on logo]

---

## Demo cut sheet (the ~90s on Slide 10)

| Step | Screen | What you click | What the audience should see | Say |
|------|--------|----------------|------------------------------|-----|
| 1 | Overview (`/app`) | — | Treasury USDC balance, Mainnet badge, "all green" | "This is live, on Mainnet." |
| 2 | Liquidity | Pick a **confirmed** invoice → Tokenize → Swap | Status flips to funded; **pesos** appear | "Confirmed invoice. One action. Cash in minutes." |
| 3 | Compliance | Open the prepared EIS filing | Payroll split + a filing **prepared, awaiting approval** | "Notice it's *waiting for me* — not already sent." |
| 4 | Compliance | Click **Approve & submit** | Status → submitted; memo reference shown | "Approved. Proof on the ledger." |

**Fallback:** keep a **pre-recorded screen capture** of exactly these four steps (≤90s) cued on the desktop. If any live step hesitates for more than ~3 seconds, say *"let me show you the clean run"* and play it. Never debug on stage. Have the recording ready by the morning of Day 1.

**Pre-flight checklist (day-of):** wallet funded · sample confirmed invoice seeded · `NEXT_PUBLIC_BASE_URL` reachable on venue Wi-Fi · recording open in a second tab · laptop charged + charger · slides exported to PDF as backup to the PPTX.

---

## Timing summary

| Segment | Slides | Target |
|---------|--------|--------|
| Hook + Change | 1–2 | 2:00 |
| Winners/Losers | 3 | 1:30 |
| Promised Land + How | 4–5 | 2:00 |
| Magic Gifts | 6–9 | 4:00 |
| Evidence + Demo | 10 | 2:00 |
| Roadmap + Team/Close | 11–12 | 1:45 |
| **Total** | | **~13:15 → trim to ~10–11 spoken; demo can compress to 60s; leaves Q&A in the 15-min slot** |

> If the slot runs tight: cut Slide 9 (Why Stellar) to one line and fold Slide 11's business model into the close. The non-negotiable beats are **2 (change)**, **7 (trust loop)**, and **10 (live evidence)**.
