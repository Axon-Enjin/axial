# deploy-mainnet.ps1
# Deploys all 4 Axial Soroban contracts to Stellar mainnet.
# Run from the soroban/ directory: .\scripts\deploy-mainnet.ps1
#
# Prerequisites:
#   1. stellar keys ls  →  your signing identity (SOURCE_KEY below)
#   2. That identity is funded with ≥10 XLM on mainnet
#   3. cargo build --target wasm32v1-none --release already ran (or run `stellar contract build`)
#
# Statutory addresses (sss / philhealth / pagibig) default to the admin key
# for the demo. Replace with real government Stellar addresses for production.

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── Configuration ─────────────────────────────────────────────────────────────

$SOURCE_KEY    = "my-key"       # stellar identity name (stellar keys ls)
$NETWORK       = "mainnet"
$PASSPHRASE    = "Public Global Stellar Network ; September 2015"
$RPC_URL       = "https://mainnet.sorobanrpc.com"   # or https://rpc.stellar.org

# Mainnet USDC SAC (Circle USDC — issuer GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN)
$USDC_CONTRACT = "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75"

# Fee settings
$ADVANCE_BPS        = 8500   # 85% advance rate
$SSS_BPS            = 500    # SSS employee deduction (5% of gross)
$PHILHEALTH_BPS     = 300    # PhilHealth employee deduction (3%)
$PAGIBIG_BPS        = 200    # Pag-IBIG employee deduction (2%)

$WASM_DIR = "target\wasm32v1-none\release"
$OUTPUT_JSON = "deployments\mainnet.json"

# ── Helper ────────────────────────────────────────────────────────────────────

function Invoke-Stellar {
    param([string[]]$Args)
    $result = & stellar @Args 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "stellar command failed (exit $LASTEXITCODE): $($Args -join ' ')`n$result"
        exit 1
    }
    return ($result | Out-String).Trim()
}

function Deploy-Contract {
    param([string]$Name)
    Write-Host "`n=== Deploy $Name ===" -ForegroundColor Cyan
    $wasm = "$WASM_DIR\$Name.wasm"
    if (-not (Test-Path $wasm)) {
        Write-Error "WASM not found: $wasm  — run 'stellar contract build' first"
        exit 1
    }
    $contractId = Invoke-Stellar @(
        "contract", "deploy",
        "--wasm", $wasm,
        "--source", $SOURCE_KEY,
        "--network", $NETWORK
    )
    Write-Host "  $Name → $contractId" -ForegroundColor Green
    return $contractId
}

# ── Preflight ─────────────────────────────────────────────────────────────────

Write-Host "Axial Mainnet Deploy" -ForegroundColor Yellow
Write-Host "Network  : $NETWORK"
Write-Host "Source   : $SOURCE_KEY"

$ADMIN = Invoke-Stellar @("keys", "public-key", $SOURCE_KEY)
Write-Host "Admin    : $ADMIN"
Write-Host "USDC SAC : $USDC_CONTRACT"

# Check WASM files exist
foreach ($c in @("receivable_token", "axial_swap", "payroll_split", "settlement")) {
    $f = "$WASM_DIR\$c.wasm"
    if (-not (Test-Path $f)) {
        Write-Error "Missing WASM: $f  — run 'stellar contract build' first"
        exit 1
    }
}
Write-Host "`nAll 4 WASMs present. Starting deploy...`n"

# ── Deploy ────────────────────────────────────────────────────────────────────

$ids = @{}
$ids["receivable_token"] = Deploy-Contract "receivable_token"
$ids["axial_swap"]       = Deploy-Contract "axial_swap"
$ids["payroll_split"]    = Deploy-Contract "payroll_split"
$ids["settlement"]       = Deploy-Contract "settlement"

Write-Host "`n=== All contracts deployed ===" -ForegroundColor Yellow
$ids.GetEnumerator() | ForEach-Object { Write-Host "  $($_.Key): $($_.Value)" }

# ── Initialize ────────────────────────────────────────────────────────────────

Write-Host "`n=== Initialize contracts ===" -ForegroundColor Cyan

# receivable_token: initialize(admin)
Write-Host "`nInitializing receivable_token..."
Invoke-Stellar @(
    "contract", "invoke",
    "--id", $ids["receivable_token"],
    "--source", $SOURCE_KEY,
    "--network", $NETWORK,
    "--", "initialize",
    "--admin", $ADMIN
) | Out-Null
Write-Host "  receivable_token initialized" -ForegroundColor Green

# axial_swap: initialize(admin, usdc, advance_bps)
Write-Host "`nInitializing axial_swap..."
Invoke-Stellar @(
    "contract", "invoke",
    "--id", $ids["axial_swap"],
    "--source", $SOURCE_KEY,
    "--network", $NETWORK,
    "--", "initialize",
    "--admin", $ADMIN,
    "--usdc", $USDC_CONTRACT,
    "--advance_bps", $ADVANCE_BPS.ToString()
) | Out-Null
Write-Host "  axial_swap initialized (advance_bps=$ADVANCE_BPS)" -ForegroundColor Green

# payroll_split: initialize(admin, usdc, sss, philhealth, pagibig, employees, sss_bps, philhealth_bps, pagibig_bps)
# Statutory addresses default to admin for demo — replace with real Stellar addresses for production
Write-Host "`nInitializing payroll_split..."
Invoke-Stellar @(
    "contract", "invoke",
    "--id", $ids["payroll_split"],
    "--source", $SOURCE_KEY,
    "--network", $NETWORK,
    "--", "initialize",
    "--admin", $ADMIN,
    "--usdc", $USDC_CONTRACT,
    "--sss", $ADMIN,
    "--philhealth", $ADMIN,
    "--pagibig", $ADMIN,
    "--employees", $ADMIN,
    "--sss_bps", $SSS_BPS.ToString(),
    "--philhealth_bps", $PHILHEALTH_BPS.ToString(),
    "--pagibig_bps", $PAGIBIG_BPS.ToString()
) | Out-Null
Write-Host "  payroll_split initialized (sss=${SSS_BPS}bps ph=${PHILHEALTH_BPS}bps hdmf=${PAGIBIG_BPS}bps)" -ForegroundColor Green

# settlement: initialize(admin, usdc)
Write-Host "`nInitializing settlement..."
Invoke-Stellar @(
    "contract", "invoke",
    "--id", $ids["settlement"],
    "--source", $SOURCE_KEY,
    "--network", $NETWORK,
    "--", "initialize",
    "--admin", $ADMIN,
    "--usdc", $USDC_CONTRACT
) | Out-Null
Write-Host "  settlement initialized" -ForegroundColor Green

# ── Write deployments/mainnet.json ────────────────────────────────────────────

$now = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$json = @{
    network      = "mainnet"
    passphrase   = $PASSPHRASE
    rpc          = $RPC_URL
    deployed_at  = $now
    roles        = @{
        admin_key    = $SOURCE_KEY
        admin_public = $ADMIN
        funder_key   = $SOURCE_KEY
        funder_public = $ADMIN
        msme_key     = $SOURCE_KEY
        msme_public  = $ADMIN
    }
    contracts    = @{
        axial_swap       = $ids["axial_swap"]
        usdc_token       = $USDC_CONTRACT
        receivable_token = $ids["receivable_token"]
        payroll_split    = $ids["payroll_split"]
        settlement       = $ids["settlement"]
    }
} | ConvertTo-Json -Depth 5

New-Item -ItemType Directory -Force -Path (Split-Path $OUTPUT_JSON) | Out-Null
$json | Out-File -FilePath $OUTPUT_JSON -Encoding utf8
Write-Host "`n=== Wrote $OUTPUT_JSON ===" -ForegroundColor Yellow
Write-Host $json

# ── Web env snippet ───────────────────────────────────────────────────────────

Write-Host "`n=== Add to web/.env.local (or Vercel env vars) ===" -ForegroundColor Yellow
Write-Host "SOROBAN_RPC_URL=https://mainnet.sorobanrpc.com"
Write-Host "STELLAR_NETWORK_PASSPHRASE=Public Global Stellar Network ; September 2015"
Write-Host "AXIAL_SWAP_CONTRACT_ID=$($ids['axial_swap'])"
Write-Host "RECEIVABLE_TOKEN_CONTRACT_ID=$($ids['receivable_token'])"
Write-Host "PAYROLL_SPLIT_CONTRACT_ID=$($ids['payroll_split'])"
Write-Host "SETTLEMENT_CONTRACT_ID=$($ids['settlement'])"
Write-Host "SOROBAN_USDC_TOKEN_ID=$USDC_CONTRACT"
Write-Host "STELLAR_ISSUER_PUBLIC=$ADMIN"
Write-Host "STELLAR_FUNDER_PUBLIC=$ADMIN"
Write-Host "STELLAR_MSME_PUBLIC=$ADMIN"
Write-Host ""
Write-Host "IMPORTANT: also set STELLAR_FUNDER_SECRET, STELLAR_MSME_SECRET, STELLAR_ISSUER_SECRET"
Write-Host "in Vercel → Settings → Environment Variables (Sensitive)"
Write-Host ""
Write-Host "Deploy complete." -ForegroundColor Green
