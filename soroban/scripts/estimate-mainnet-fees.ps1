# estimate-mainnet-fees.ps1
# Produces a verifiable cost estimate for deploying all 4 Axial Soroban contracts
# to Stellar mainnet. Pulls live fee data from Horizon; no funded account required.
#
# Run from the soroban/ directory:
#   .\scripts\estimate-mainnet-fees.ps1

Set-StrictMode -Version Latest
$ErrorActionPreference = "SilentlyContinue"

$SEP = "=" * 62
$passphrase = "Public Global Stellar Network" + " ; " + "September 2015"

Write-Host $SEP -ForegroundColor Yellow
Write-Host " Axial Soroban -- Mainnet Deployment Cost Estimate" -ForegroundColor Yellow
Write-Host $SEP -ForegroundColor Yellow
$now = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss")
Write-Host " Generated : $now UTC"
Write-Host " Network   : Stellar Mainnet"
Write-Host " Passphrase: $passphrase"
Write-Host " Horizon   : https://horizon.stellar.org"
Write-Host ""

# ── 1. Toolchain ─────────────────────────────────────────────────────────────

Write-Host "[ 1 / 5 ]  Toolchain" -ForegroundColor Cyan
$cliVer   = (& stellar --version 2>&1 | Out-String).Trim()
$rustVer  = (& rustc --version 2>&1 | Out-String).Trim()
$cargoVer = (& cargo --version 2>&1 | Out-String).Trim()
Write-Host "  Stellar CLI : $cliVer"
Write-Host "  Rust        : $rustVer"
Write-Host "  Cargo       : $cargoVer"
Write-Host "  WASM target : wasm32v1-none (release)"
Write-Host ""

# ── 2. WASM artifact sizes ────────────────────────────────────────────────────

Write-Host "[ 2 / 5 ]  Compiled WASM Artifacts" -ForegroundColor Cyan
$WASM_DIR   = "target\wasm32v1-none\release"
$contracts  = @("receivable_token", "axial_swap", "payroll_split", "settlement")
$allFound   = $true
$totalBytes = 0

foreach ($c in $contracts) {
    $f = "$WASM_DIR\$c.wasm"
    if (Test-Path $f) {
        $sz = (Get-Item $f).Length
        $totalBytes += $sz
        $hash = (Get-FileHash $f -Algorithm SHA256).Hash.ToLower()
        $shortHash = $hash.Substring(0, 16) + "..."
        Write-Host ("  {0,-22} {1,8:N0} bytes  ({2:F1} KB)  sha256:{3}" -f "$c.wasm", $sz, ($sz / 1024), $shortHash)
    } else {
        Write-Host "  $c.wasm  -- NOT FOUND (run 'stellar contract build')" -ForegroundColor Red
        $allFound = $false
    }
}

Write-Host ""
if ($allFound) {
    $totalKb = [math]::Round($totalBytes / 1024, 1)
    Write-Host "  Total WASM upload size : $totalBytes bytes  ($totalKb KB)" -ForegroundColor Green
} else {
    Write-Host "  WARNING: one or more WASMs missing. Run 'stellar contract build' first." -ForegroundColor Red
}
Write-Host ""

# ── 3. Live Horizon fee stats ─────────────────────────────────────────────────

Write-Host "[ 3 / 5 ]  Live Mainnet Fee Statistics  (Horizon /fee_stats)" -ForegroundColor Cyan
try {
    $fs = Invoke-RestMethod "https://horizon.stellar.org/fee_stats" -TimeoutSec 10
    Write-Host ("  Last ledger            : {0}" -f $fs.last_ledger)
    $baseFeeXlm = [double]$fs.last_ledger_base_fee / 1e7
    Write-Host ("  Last ledger base fee   : {0} stroops  ({1} XLM)" -f $fs.last_ledger_base_fee, $baseFeeXlm)
    Write-Host ""
    Write-Host "  Inclusion fee charged (stroops):"
    Write-Host ("    p10={0}  p50={1}  p90={2}  p99={3}" -f $fs.fee_charged.p10, $fs.fee_charged.p50, $fs.fee_charged.p90, $fs.fee_charged.p99)
    $rfc = $fs.PSObject.Properties["resource_fee_charged"]
    if ($rfc -and $rfc.Value) {
        $r = $rfc.Value
        Write-Host "  Soroban resource fee charged (stroops):"
        Write-Host ("    p10={0}  p50={1}  p90={2}  p99={3}" -f $r.p10, $r.p50, $r.p90, $r.p99)
    }
    Write-Host ""
    Write-Host "  Note: 1 stroop = 0.0000001 XLM  |  10,000,000 stroops = 1 XLM"
} catch {
    Write-Host "  Could not reach Horizon. Check network connectivity." -ForegroundColor Yellow
}
Write-Host ""

# ── 4. Deployer identity & balance ───────────────────────────────────────────

$DEPLOYER_PK = "GB6TMTI6DB6BETQEPMKXOAYAMYKGNHR4AJVZHKEQ5LCVFINGEDQDKCFI"

Write-Host "[ 4 / 5 ]  Deployer Identity & Mainnet Balance" -ForegroundColor Cyan
Write-Host "  Public key : $DEPLOYER_PK"
Write-Host "  Explorer   : https://stellar.expert/explorer/public/account/$DEPLOYER_PK"
Write-Host ""

# Find which stellar CLI identity holds this key
$identityName = $null
$knownIds = (& stellar keys ls 2>&1 | Out-String).Trim() -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
foreach ($id in $knownIds) {
    $candidate = (& stellar keys public-key $id 2>&1 | Out-String).Trim()
    if ($candidate -eq $DEPLOYER_PK) { $identityName = $id; break }
}
if ($identityName) {
    Write-Host "  Stellar CLI identity : $identityName" -ForegroundColor Green
} else {
    Write-Host "  Stellar CLI identity : NOT IMPORTED" -ForegroundColor Yellow
    Write-Host "  To import: stellar keys add axial-deployer --secret-key"
}
Write-Host ""

try {
    $resp = Invoke-WebRequest "https://horizon.stellar.org/accounts/$DEPLOYER_PK" -UseBasicParsing -TimeoutSec 10
    $acct = [System.Text.Encoding]::UTF8.GetString($resp.Content) | ConvertFrom-Json
    $xlmBal = ($acct.balances | Where-Object { $_.asset_type -eq "native" }).balance
    $xlmNum = [double]$xlmBal
    $color = if ($xlmNum -ge 10) { "Green" } elseif ($xlmNum -ge 1) { "Yellow" } else { "Red" }
    Write-Host "  XLM balance  : $xlmBal XLM" -ForegroundColor $color
    Write-Host "  Sub-entries  : $($acct.subentry_count)"
    if ($xlmNum -lt 10) {
        $needed = [math]::Round(10 - $xlmNum, 2)
        Write-Host "  Needs $needed more XLM to reach recommended 10 XLM" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  Account status : NOT ACTIVATED on mainnet" -ForegroundColor Yellow
    Write-Host "  Action needed  : Send >= 10 XLM to $DEPLOYER_PK to activate"
}
Write-Host ""

# ── 5. Cost breakdown ─────────────────────────────────────────────────────────

Write-Host "[ 5 / 5 ]  Itemized Deployment Cost Breakdown" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Stellar reserves: every ledger entry costs 0.5 XLM base reserve."
Write-Host "  Reference: https://developers.stellar.org/docs/learn/fundamentals/lumens"
Write-Host ""

$lineItems = @(
    @{ Item = "Account activation reserve (base)";     XLM = 1.0 }
    @{ Item = "4 contract code entries x 0.5 XLM";     XLM = 2.0 }
    @{ Item = "4 contract instance entries x 0.5 XLM"; XLM = 2.0 }
    @{ Item = "WASM upload fees (~0.5 XLM x 4)";       XLM = 2.0 }
    @{ Item = "initialize() fees (~0.05 XLM x 4)";     XLM = 0.2 }
    @{ Item = "Gas buffer / fee spike headroom";        XLM = 0.5 }
)

$total = 0.0
foreach ($row in $lineItems) {
    $total += $row.XLM
    Write-Host ("  {0,-46} {1,5:F1} XLM" -f $row.Item, $row.XLM)
}
Write-Host ("  " + ("-" * 52))
Write-Host ("  {0,-46} {1,5:F1} XLM" -f "MINIMUM ESTIMATE", $total) -ForegroundColor Yellow
Write-Host ("  {0,-46} {1,5:F1} XLM" -f "RECOMMENDED (safe margin)", 10.0) -ForegroundColor Green
Write-Host ""
if ($totalBytes -gt 0) {
    $totalKbFmt = [math]::Round($totalBytes / 1024, 1)
    Write-Host "  All 4 WASMs total $totalBytes bytes ($totalKbFmt KB)."
}
Write-Host "  WASM upload resource fees scale with WASM size; within typical single-digit XLM range."
Write-Host ""
Write-Host "  Fund deployer: $DEPLOYER_PK"
Write-Host ""

Write-Host $SEP -ForegroundColor Yellow
Write-Host " End of estimate" -ForegroundColor Yellow
Write-Host $SEP -ForegroundColor Yellow
