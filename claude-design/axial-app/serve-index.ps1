# Serves axial-app/static UI kit (index.html + JSX) over HTTP.
# file:// URLs often fail to load local .jsx modules; use this instead.

$ErrorActionPreference = "Stop"
$Port = 8765
$Root = $PSScriptRoot
Set-Location $Root

$python = Get-Command py -ErrorAction SilentlyContinue
if (-not $python) { $python = Get-Command python -ErrorAction SilentlyContinue }

if ($python) {
  Write-Host "Serving $Root"
  Write-Host "Open http://127.0.0.1:$Port/index.html"
  Write-Host "Press Ctrl+C to stop."
  Start-Process "http://127.0.0.1:$Port/index.html"
  & $python.Source -m http.server $Port --bind 127.0.0.1 --directory $Root
  exit $LASTEXITCODE
}

$npx = Get-Command npx -ErrorAction SilentlyContinue
if ($npx) {
  Write-Host "Python not found; using npx serve…"
  Write-Host "Serving $Root → http://127.0.0.1:${Port}/index.html"
  Write-Host "Press Ctrl+C to stop."
  Push-Location $Root
  try {
    Start-Process "http://127.0.0.1:$Port/index.html"
    npx --yes serve@latest -n -l tcp://127.0.0.1:$Port .
  }
  finally { Pop-Location }
  exit $LASTEXITCODE
}

Write-Host "Install Python (py/python) or Node.js so npx serve is available."
exit 1
