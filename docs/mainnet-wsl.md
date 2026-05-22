# Mainnet — WSL only

All Stellar CLI, deploy, `.env.local`, and GCP secrets run in **WSL**.  
Cloud Run **image** deploy stays in GitHub Actions (your existing workflow).

## One command (contracts already deployed)

```bash
cd /mnt/c/Users/User/CODERIST/axonjn/axial/soroban
sed -i 's/\r$//' scripts/*.sh
./scripts/mainnet-setup.sh
```

This will:

1. Verify Stellar CLI + mainnet network
2. Prompt once to import deployer secret if `mainnet-deployer` is missing (`GB6TMT…` in `deployments/mainnet.json`)
3. Write `MAINNET_*` into `web/.env.local`
4. Upload `MAINNET_STELLAR_*_SECRET` to GCP via `gcloud` in WSL (skips if `gcloud` not installed)
5. Set GitHub Variables via `apply-github-mainnet-vars.sh` (or print to stdout)

## Fresh deploy (WSL)

```bash
export SOURCE_KEY=mainnet-wallet   # after: stellar keys add mainnet-wallet --secret-key
./scripts/mainnet-setup.sh --deploy
```

## Teammate deployed, you use your wallet

See **[teammate-mainnet-handoff.md](teammate-mainnet-handoff.md)** — contracts are `GB6TMT…` (other dev); you demo with **`GDSCT…`** (Freighter + your XLM/USDC).

| Role | Address |
|------|---------|
| Server mint/swap (teammate’s secret in GCP) | `GB6TMT…` |
| Your Freighter — receive swap + sign payroll | `GDSCT…` |

## App

1. Freighter → **Mainnet** → Connect  
2. Settings → **Stellar network** → **Mainnet**  
3. Liquidity → upload / tokenize & swap  

## Flags

| Flag | Meaning |
|------|---------|
| `--deploy` | Build + deploy 4 contracts, then sync env |
| `--env-only` | Skip GCP upload |

## Troubleshooting

- **Identity mismatch** — `stellar keys add mainnet-deployer --secret-key` with the `S…` for `GB6TMT…`
- **gcloud missing** — install [Google Cloud SDK in WSL](https://cloud.google.com/sdk/docs/install) or upload secrets in GCP console manually
- **invalid encoded string** — GCP has `G…` not `S…`; re-run `./scripts/mainnet-setup.sh`
