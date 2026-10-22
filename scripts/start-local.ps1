$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$python = Join-Path $root '.venv\Scripts\python.exe'
if (!(Test-Path -LiteralPath $python)) { throw 'Run the setup commands in README first.' }
$qa = Join-Path $root 'qa'
New-Item -ItemType Directory -Force -Path $qa | Out-Null
foreach ($port in @(8410,3410)) {
  if (Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue) { throw "Port $port is already in use; no existing process was stopped." }
}
Push-Location (Join-Path $root 'services\api')
try { & $python -m alembic upgrade head; if ($LASTEXITCODE) { throw 'Migration failed' }; & $python -m app.cli seed; if ($LASTEXITCODE) { throw 'Seed failed' } } finally { Pop-Location }
$api = Start-Process -FilePath $python -ArgumentList '-m','uvicorn','app.main:app','--host','127.0.0.1','--port','8410' -WorkingDirectory (Join-Path $root 'services\api') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $qa 'api.log') -RedirectStandardError (Join-Path $qa 'api-error.log') -PassThru
$env:NEXT_TELEMETRY_DISABLED='1'
$node=(Get-Command node.exe).Source
$publicTarget=Join-Path $root 'apps/web/.next/standalone/public'
$staticTarget=Join-Path $root 'apps/web/.next/standalone/.next/static'
New-Item -ItemType Directory -Force -Path $publicTarget,$staticTarget | Out-Null
Get-ChildItem -LiteralPath (Join-Path $root 'apps/web/public') | Copy-Item -Destination $publicTarget -Recurse -Force
Get-ChildItem -LiteralPath (Join-Path $root 'apps/web/.next/static') | Copy-Item -Destination $staticTarget -Recurse -Force
$env:HOSTNAME='127.0.0.1'
$env:PORT='3410'
$web=Start-Process -FilePath $node -ArgumentList (Join-Path $root 'apps/web/.next/standalone/server.js') -WorkingDirectory (Join-Path $root 'apps\web') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $qa 'web.log') -RedirectStandardError (Join-Path $qa 'web-error.log') -PassThru
@{api=$api.Id;web=$web.Id;started=(Get-Date).ToString('o')} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $qa 'local-processes.json')
Write-Host 'Nebula local preview: http://127.0.0.1:3410 (loopback only)'
Write-Host 'Use scripts/stop-local.ps1 to stop only the recorded Nebula processes.'
