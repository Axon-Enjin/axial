# Axial — Mainnet Settle Dry-Run Checklist (S5)

**Date:** 2026-07-15  
**Purpose:** Verify closed-loop settlement before claiming S5 complete in product/docs.

## Prerequisites

- [ ] Supabase migration `007_on_chain_invoice_id.sql` applied on hosted project
- [ ] `SETTLEMENT_CONTRACT_ID` + `MAINNET_STELLAR_FUNDER_SECRET` configured on Cloud Run / local `.env`
- [ ] Freighter on **Stellar Public (Mainnet)** with USDC trustline
- [ ] Funder treasury holds enough USDC for advance

## Full path (happy path)

1. **Liquidity:** Upload or seed invoice → Confirm payer → Clear-sign → Tokenize & Swap  
   - [ ] Toast shows **Mint** + **Swap** tx hashes  
   - [ ] Invoice row stores `onChainInvoiceId` (check PATCH settle response or Supabase row)

2. **Payer portal:** Open magic link → Confirm → Ack NoA → Connect Freighter → Pay lockbox  
   - [ ] Fund tx hash on Stellar Expert  
   - [ ] Settlement pipeline shows: Funding → Collecting → Settling → Complete  
   - [ ] `mark_collected` returns `settlement.txHash` (not 502)

3. **Funder book:** Liquidity → Funder Protection Center  
   - [ ] Deal status → **Repaid**  
   - [ ] Collected amount matches face (or effective collected)

4. **Overview:** Proof strip  
   - [ ] Repaid / collected count increments  
   - [ ] Financed face reflects book

## Partial path

1. Fund lockbox with amount **below advance** (e.g. 60% of face)  
2. `mark_collected` → `settleOnChain` caps to lockbox balance  
3. Funder book → **Partial**; shortfall visible in deal drawer

## Zero balance path

1. Call `mark_collected` **without** funding lockbox  
2. Expect **502** with message: lockbox USDC balance is zero  
3. UI (payer portal) shows settle error — not silent success

## API smoke (curl)

```bash
# After payer funds lockbox
curl -X PATCH "$BASE/api/invoices/INV-XXX" \
  -H "Content-Type: application/json" \
  -d '{"action":"mark_collected","collectedAmount":100000}'
```

Expected: `{ invoice, settlement: { txHash, effectiveCollected, lockboxBalance } }`

## Sign-off

| Run | Date | Operator | Result |
|-----|------|----------|--------|
| 1 | | | |
| 2 | | | |
| 3 | | | |
