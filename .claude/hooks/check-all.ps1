# check-all.ps1 - בדיקה מקיפה בסוף עבודה

$errors = @()

# --- בדיקת TypeScript ---
if (Test-Path "package.json") {
    $pkg = Get-Content "package.json" -Raw
    if ($pkg -match '"typecheck"') {
        Write-Host "Running TypeScript check..."
        $result = npm run typecheck 2>&1
        if ($LASTEXITCODE -ne 0) {
            $errors += "❌ TypeScript errors found. Run 'npm run typecheck' to see details."
        }
    }
}

# --- בדיקת ESLint ---
if (Test-Path "package.json") {
    $pkg = Get-Content "package.json" -Raw
    if ($pkg -match '"lint"') {
        Write-Host "Running ESLint..."
        $result = npm run lint 2>&1
        if ($LASTEXITCODE -ne 0) {
            $errors += "❌ ESLint errors found. Run 'npm run lint' to see details."
        }
    }
}

# --- בדיקת קבצים גדולים ---
Write-Host "Checking file sizes..."
if (Test-Path "src") {
    Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx" | ForEach-Object {
        # Use -LiteralPath to handle special characters like [id] in paths
        $lines = (Get-Content -LiteralPath $_.FullName | Measure-Object -Line).Lines
        # 400 lines threshold - forms and routers with many fields can be larger
        if ($lines -gt 400) {
            $errors += "❌ Large file: $($_.FullName) ($lines lines)"
        }
    }
}

# --- סיכום ---
if ($errors.Count -gt 0) {
    Write-Host "`n🚨 Quality issues found:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Error $_ }
    exit 2
}

Write-Host "✅ All quality checks passed!" -ForegroundColor Green
exit 0