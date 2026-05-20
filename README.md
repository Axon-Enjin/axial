# Axial

Liquidity and compliance engine for Philippine MSMEs — **Build on Stellar Philippines Hackathon 2026**.

| Area | Path | Status |
|------|------|--------|
| Product docs | [`docs/Axial.md`](docs/Axial.md) | Canonical spec |
| Web UI (Next.js) | [`web/`](web/) | Four-tab app |
| Soroban contracts | [`soroban/`](soroban/) | Workspace scaffold (3 crates) |

## Quick start

**Frontend** (from `web/`):

```bash
cd web && npm install && npm run dev
```

**Soroban** (WSL — see [`soroban/CONTRIBUTING.md`](soroban/CONTRIBUTING.md)):

```bash
cd soroban && make setup && make build && make test
# Full testnet deploy + web env (WSL, ~3 min):
cd soroban && make testnet-demo
```

## Team

- Contract map: [`soroban/CONTRACTS.md`](soroban/CONTRACTS.md)
- Dev guide for agents: [`CLAUDE.md`](CLAUDE.md)
