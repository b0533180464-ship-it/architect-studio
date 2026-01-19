# check-file.ps1 - בודק גודל קובץ אחרי כל עריכה

$files = $env:CLAUDE_FILE_PATHS -split ' '
$errors = @()

foreach ($file in $files) {
    if (-not $file) { continue }
    if ($file -notmatch '\.(ts|tsx|js|jsx)$') { continue }
    if (-not (Test-Path $file)) { continue }
    
    $lines = (Get-Content $file | Measure-Object -Line).Lines
    
    if ($lines -gt 150) {
        $errors += "❌ $file has $lines lines (max 150). Split into smaller files."
    }
}

if ($errors.Count -gt 0) {
    $errors | ForEach-Object { Write-Error $_ }
    exit 2
}

Write-Host "✅ File size OK"
exit 0