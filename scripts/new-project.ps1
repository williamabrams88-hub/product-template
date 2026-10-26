# Windows wrapper for scripts/new-project.sh. UNTESTED: this template was built and tested in WSL 2.
# It needs bash (Git for Windows or WSL). Usage: ./scripts/new-project.ps1 <name> [--dry-run] [--skip-scaffold]
param([Parameter(ValueFromRemainingArguments = $true)] [string[]] $Arguments)

$bash = Get-Command bash -ErrorAction SilentlyContinue
if (-not $bash) {
    Write-Error "bash was not found. Install Git for Windows or use WSL 2, then run this again."
    exit 1
}
$script = Join-Path $PSScriptRoot "new-project.sh"
& $bash.Source $script @Arguments
exit $LASTEXITCODE
