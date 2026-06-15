# Generate AXIAL_FUNDER_PORTAL_TOKEN if missing, write to web/.env.local, print portal URL.
param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path,
  [switch]$Quiet
)

$ErrorActionPreference = "Stop"
$envFile = Join-Path $ProjectRoot "web\.env.local"

function New-FunderPortalToken {
  $bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  return [Convert]::ToBase64String($bytes).TrimEnd("=").Replace("+", "-").Replace("/", "_")
}

function Get-EnvValue {
  param([string]$Path, [string]$Name)
  if (-not (Test-Path $Path)) { return $null }
  foreach ($line in Get-Content $Path) {
    if ($line -match "^\s*$Name=(.*)$") {
      return $Matches[1].Trim().Trim('"').Trim("'")
    }
  }
  return $null
}

function Set-EnvValue {
  param([string]$Path, [string]$Name, [string]$Value)
  $lines = @()
  $found = $false
  if (Test-Path $Path) {
    foreach ($line in Get-Content $Path) {
      if ($line -match "^\s*$Name=") {
        $lines += "$Name=$Value"
        $found = $true
      } else {
        $lines += $line
      }
    }
  }
  if (-not $found) {
    if ($lines.Count -gt 0 -and $lines[-1] -ne "") { $lines += "" }
    $lines += "# Funder portal magic link (?token=...) for external LPs"
    $lines += "$Name=$Value"
  }
  $dir = Split-Path $Path -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  Set-Content -Path $Path -Value ($lines -join "`n") -Encoding utf8
}

$existing = Get-EnvValue -Path $envFile -Name "AXIAL_FUNDER_PORTAL_TOKEN"
if ($existing) {
  $token = $existing
  if (-not $Quiet) { Write-Host "==> AXIAL_FUNDER_PORTAL_TOKEN already in web/.env.local" }
} else {
  $token = New-FunderPortalToken
  Set-EnvValue -Path $envFile -Name "AXIAL_FUNDER_PORTAL_TOKEN" -Value $token
  if (-not $Quiet) { Write-Host "==> Generated AXIAL_FUNDER_PORTAL_TOKEN and saved to web/.env.local" }
}

$baseUrl = Get-EnvValue -Path $envFile -Name "NEXT_PUBLIC_BASE_URL"
if (-not $baseUrl) { $baseUrl = "http://localhost:3000" }
$portalUrl = "$baseUrl/app/funder-portal?token=$token"

if (-not $Quiet) {
  Write-Host ""
  Write-Host "Portal token (store in GCP Secret Manager - do not commit):"
  Write-Host $token
  Write-Host ""
  Write-Host "Shareable LP link:"
  Write-Host $portalUrl
}

Write-Output $token
