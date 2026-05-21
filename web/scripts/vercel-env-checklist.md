# Vercel env checklist (paste order)

Use **Production** + **Preview** in Vercel → Settings → Environment Variables.

## Sensitive (mark as Sensitive in Vercel)

- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `STELLAR_FUNDER_SECRET`
- [ ] `STELLAR_MSME_SECRET`
- [ ] `STELLAR_ISSUER_SECRET`

## Plain

- [ ] `SUPABASE_URL` = `https://ifzyntqwymmgimnxtguz.supabase.co`
- [ ] `SOROBAN_RPC_URL` = `https://soroban-testnet.stellar.org`
- [ ] `STELLAR_NETWORK_PASSPHRASE` = `Test SDF Network ; September 2015`
- [ ] `AXIAL_SWAP_CONTRACT_ID`
- [ ] `RECEIVABLE_TOKEN_CONTRACT_ID`
- [ ] `PAYROLL_SPLIT_CONTRACT_ID`
- [ ] `SOROBAN_USDC_TOKEN_ID`
- [ ] `STELLAR_ISSUER_PUBLIC`
- [ ] `STELLAR_FUNDER_PUBLIC`
- [ ] `STELLAR_MSME_PUBLIC`

## Optional demo

- [ ] `AXIAL_ALLOW_SEED` = `true` (preview only)
- [ ] `EIS_JWS_MOCK_SECRET`
- [ ] `AXIAL_ORG_ID`

Full values: `web/.env.example` · Guide: `docs/vercel-deployment.md`
