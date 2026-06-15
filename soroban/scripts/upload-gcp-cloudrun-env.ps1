# Sync Axial Cloud Run env + funder portal secret from web/.env.local (Windows PowerShell + gcloud).
param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path,
  [string]$Project = $env:GCP_PROJECT_ID,
  [string]$Region = "asia-southeast1",
  [string]$Service = "axial-web",
  [switch]$SkipTokenGenerate
)

$ErrorActionPreference = "Stop"
if (-not $Project) { $Project = "geraldberongoy" }

$envFile = Join-Path $ProjectRoot "web\.env.local"
if (-not (Test-Path $envFile)) {
  Write-Error "Missing $envFile - run soroban/scripts/write-mainnet-web-env.sh first"
}

if (-not $SkipTokenGenerate) {
  & (Join-Path $PSScriptRoot "ensure-funder-portal-token.ps1") -ProjectRoot $ProjectRoot
}

function Get-EnvValue {
  param([string]$Name)
  foreach ($line in Get-Content $envFile) {
    if ($line -match "^\s*$Name=(.*)$") {
      return $Matches[1].Trim().Trim('"').Trim("'")
    }
  }
  return $null
}

function Upload-Secret {
  param([string]$Name, [string]$Value, [switch]$AllowAnyFormat)
  if ([string]::IsNullOrWhiteSpace($Value)) {
    Write-Host "SKIP: $Name not in .env.local"
    return
  }
  if (-not $AllowAnyFormat -and $Value -notmatch '^S[A-Z0-9]{55}$') {
    Write-Error "$Name must be a 56-char Stellar secret (S...)"
  }
  $prevEap = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $null = & gcloud secrets describe $Name --project=$Project 2>&1
  $exists = $LASTEXITCODE -eq 0
  $ErrorActionPreference = $prevEap

  if ($exists) {
    Write-Host "==> Updating secret $Name"
    $Value | gcloud secrets versions add $Name --project=$Project --data-file=-
  } else {
    Write-Host "==> Creating secret $Name"
    $Value | gcloud secrets create $Name --project=$Project --replication-policy=automatic --data-file=-
  }
  if ($LASTEXITCODE -ne 0) { throw "gcloud secret upload failed for $Name" }
}

Write-Host "==> GCP Secret Manager (project: $Project)"
foreach ($stellar in @(
  "MAINNET_STELLAR_ISSUER_SECRET",
  "MAINNET_STELLAR_FUNDER_SECRET",
  "MAINNET_STELLAR_MSME_SECRET"
)) {
  Upload-Secret -Name $stellar -Value (Get-EnvValue $stellar)
}

$supabaseKey = Get-EnvValue "SUPABASE_SERVICE_ROLE_KEY"
if ($supabaseKey) {
  Upload-Secret -Name "SUPABASE_SERVICE_ROLE_KEY" -Value $supabaseKey -AllowAnyFormat
}

$funderToken = Get-EnvValue "AXIAL_FUNDER_PORTAL_TOKEN"
if ($funderToken) {
  Upload-Secret -Name "AXIAL_FUNDER_PORTAL_TOKEN" -Value $funderToken -AllowAnyFormat
}

Write-Host "==> Updating Cloud Run service $Service ($Region)"
$secretBindings = @(
  "SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest",
  "MAINNET_STELLAR_ISSUER_SECRET=MAINNET_STELLAR_ISSUER_SECRET:latest",
  "MAINNET_STELLAR_FUNDER_SECRET=MAINNET_STELLAR_FUNDER_SECRET:latest",
  "MAINNET_STELLAR_MSME_SECRET=MAINNET_STELLAR_MSME_SECRET:latest"
)
if ($funderToken) {
  $secretBindings += "AXIAL_FUNDER_PORTAL_TOKEN=AXIAL_FUNDER_PORTAL_TOKEN:latest"
}

$bindings = $secretBindings -join ","
gcloud run services update $Service `
  --project=$Project `
  --region=$Region `
  --update-secrets="$bindings"

if ($LASTEXITCODE -ne 0) { throw "Cloud Run update failed" }

$baseUrl = Get-EnvValue "NEXT_PUBLIC_BASE_URL"
if (-not $baseUrl) {
  $baseUrl = gcloud run services describe $Service --project=$Project --region=$Region --format="value(status.url)"
}
if ($funderToken -and $baseUrl) {
  Write-Host ""
  Write-Host "LP portal link:"
  Write-Host "$baseUrl/app/funder-portal?token=$funderToken"
}
Write-Host "==> Done"
