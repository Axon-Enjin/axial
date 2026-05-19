# Axial

Liquidity and compliance engine for Philippine MSMEs — **Build on Stellar Philippines Hackathon 2026**.

| Area | Path | Status |
|------|------|--------|
| Product docs | [`docs/Axial.md`](docs/Axial.md) | Canonical spec |
| Web UI (Next.js) | [`prototype/`](prototype/) | Four-tab prototype |
| Soroban contracts | [`soroban/`](soroban/) | Workspace scaffold (3 crates) |

## Quick start

**Frontend** (from `prototype/`):

```bash
npm install && npm run dev
```

**Soroban** (WSL — see [`soroban/CONTRIBUTING.md`](soroban/CONTRIBUTING.md)):

```bash
cd soroban && make setup && make build && make test
```

## Team

- Contract map: [`soroban/CONTRACTS.md`](soroban/CONTRACTS.md)
- Dev guide for agents: [`CLAUDE.md`](CLAUDE.md)
