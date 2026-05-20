# Testnet demo (beginner)

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
2. Build and deploy `axial_swap`
3. Create a test USDC token and mint to treasury
4. Initialize the swap contract
5. Run one test swap on-chain
6. Write `soroban/.env`, `deployments/testnet.json`, and `web/.env.local`

Takes about 2–5 minutes.

## Then run the UI

```bash
cd /mnt/c/Users/User/CODERIST/axonjn/axial/web
npm run dev
```

Open **Liquidity** → click **Execute Atomic Swap** on a minted invoice (use a fresh invoice id if you already swapped one on-chain).

## If something fails

```bash
./scripts/check-testnet.sh
```

Paste the error (never paste `S...` secret keys in chat).
