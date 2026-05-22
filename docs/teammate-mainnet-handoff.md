# Mainnet: teammate deployed, you fund & demo

Contracts in `soroban/deployments/mainnet.json` were deployed by another dev. **You use your own wallet for the hackathon demo.**

## Two wallets (this is normal)

| Who | Address | Role |
|-----|---------|------|
| **Teammate (deployer)** | `GB6TMTI6DB6BETQEPMKXOAYAMYKGNHR4AJVZHKEQ5LCVFINGEDQDKCFI` | Contract admin, server **issuer** + **funder** (mint/swap on Cloud Run) |
| **You (Freighter)** | `GDSCTQZRRGF23F5GWNE3FYLLPEGO23BB3RQ6AYO5756C7A4HJLEXZVTQ` | **Receive** swap advance, **sign** payroll in the browser |

Axial is already configured so **MSME = your `GDSCT…`** when Freighter is connected. Issuer/funder stay `GB6TMT…` (matches the deploy).

## Your tasks (your funds on `GDSCT…`)

1. **Freighter** → network **Mainnet** → connect `GDSCT…`
2. **Fund your wallet** on mainnet:
   - **XLM** — for signing payroll (~1–2 XLM is enough for demo)
   - **USDC trustline** — Circle USDC issuer `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` (you receive the swap advance here)
3. **App** → Settings → **Stellar network** → **Mainnet**
4. **Liquidity** → connect Freighter first → upload / tokenize & swap (advance lands on **your** `GDSCT…`)

You do **not** need the teammate’s secret key for Freighter or payroll.

## What still needs the teammate (server mint/swap)

Cloud Run signs mint + swap with **`GB6TMT…`** secrets. For production **Tokenize & Swap** to work on-chain, ask your teammate for **one** of:

| Option | What to ask |
|--------|-------------|
| **A (best)** | Teammate sends **`S…`** (56 chars) for `GB6TMT…` — **not** your Freighter `GDSCT…` secret. In WSL: `MAINNET_DEPLOYER_SECRET='S...' ./scripts/import-mainnet-deployer.sh` then `./scripts/mainnet-setup.sh` |
| **B** | They add **`MAINNET_STELLAR_*_SECRET`** to GCP Secret Manager themselves |
| **C** | They keep **USDC on `GB6TMT…`** (funder pays the swap); you only receive on `GDSCT…` |

Without `GB6TMT…` secrets on the server, mainnet still shows contracts but mint/swap on **axial.axonenjin.com** stays demo/off-chain until A or B is done.

## Optional: redeploy with your wallet

Only if the team agrees to replace contracts:

```bash
stellar keys add mainnet-wallet --secret-key   # your GDSCT… export
SOURCE_KEY=mainnet-wallet ./scripts/mainnet-setup.sh --deploy
```

That makes **you** admin/funder/issuer on new contract IDs.

## Quick checklist

- [ ] Freighter Mainnet + `GDSCT…` connected  
- [ ] XLM on `GDSCT…`  
- [ ] USDC trustline on `GDSCT…`  
- [ ] App network = Mainnet  
- [ ] Teammate shared `GB6TMT…` **S…** for GCP **or** funded `GB6TMT…` USDC for funder  
