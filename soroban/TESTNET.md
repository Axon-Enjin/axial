# Testnet sandbox (developer onboarding)

Axial's **operating network is Stellar Mainnet**. This guide is for local end-to-end iteration on Testnet only — not the demo path judges see in production.

Your keys are already on this machine:

| Name | Role | Public address |
|------|------|----------------|
| `admin-key` | Deploy + init + mint | `GD67NPG7TKJDE5HEHSPWS3YAWYNHWTLWRSQMTO4NQOVSZAEFPICO3HYG` |
| `treasury-key` | Funder (pays USDC) | `GBRLGRWUJXJSHJDZQ4OH2SDH7ROF7EWAHI4ZIQM2E6TMONH7IG4P7QKL` |
| `my-key` | MSME (receives advance) | `GBCVJCRULTHI74CXNP4QFGE6OSK5XFUYIPPEONRNXS3JQSKA26TDAR66` |

## One command (WSL)

```bash
cd /mnt/c/Users/User/CODERIST/axonjn/axial/soroban
chmod +x scripts/testnet-demo-setup.sh
./scripts/testnet-demo-setup.sh
```

This script will:

1. Fund your 3 accounts (testnet XLM)
2. Build and deploy `axial_swap` (swap happy-path)
3. Create a test USDC token and mint to treasury
4. Initialize the swap contract
5. Run one test swap on-chain
6. Write `soroban/.env`, `deployments/testnet.json`, and `web/.env.local`

The other three contracts (`receivable_token`, `payroll_split`, `settlement`) are deployed via `make deploy-all` on Testnet, or via `./scripts/deploy-mainnet.sh` for the operating network.

Takes about 2–5 minutes.

## Then run the UI

```bash
cd /mnt/c/Users/User/CODERIST/axonjn/axial/web
npm run dev
```

The app defaults to **Mainnet** (`web/lib/soroban/network.ts` is fixed to Mainnet). The Testnet sandbox is for local Soroban-side iteration; to exercise swaps against Testnet contracts you would need to point env at `deployments/testnet.json` and override the network — the production demo path uses Mainnet contract IDs from `deployments/mainnet.json`.

Open **Liquidity** → click **Execute Atomic Swap** on a minted invoice (use a fresh invoice id if you already swapped one on-chain).

## If something fails

```bash
./scripts/check-testnet.sh
```

Paste the error (never paste `S...` secret keys in chat).
