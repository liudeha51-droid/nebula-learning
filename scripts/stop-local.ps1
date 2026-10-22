$root=Split-Path $PSScriptRoot -Parent
$record=Join-Path $root 'qa\local-processes.json'
if (!(Test-Path -LiteralPath $record)) { Write-Host 'No recorded launch. Nothing stopped.'; exit }
$pids=Get-Content -LiteralPath $record -Raw | ConvertFrom-Json
foreach ($id in @($pids.api,$pids.web)) {
  $process=Get-CimInstance Win32_Process -Filter "ProcessId=$id" -ErrorAction SilentlyContinue
  if ($process -and ($process.CommandLine -match 'uvicorn app.main:app' -or $process.CommandLine -match 'nebula-learning.*[/\\]standalone[/\\]server.js')) {
    Stop-Process -Id $id
    Write-Host "Stopped verified Nebula process $id"
  }
}
