# Smart River Watch Backend - Setup Script

Write-Host "Setting up Smart River Watch Backend..." -ForegroundColor Cyan

# Check Node.js installation
Write-Host "`nChecking Node.js installation..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js version: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Node.js is not installed. Please install Node.js >= 18.0.0" -ForegroundColor Red
    exit 1
}

# Check npm installation
Write-Host "`nChecking npm installation..." -ForegroundColor Yellow
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Write-Host "[OK] npm version: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "[ERROR] npm is not installed" -ForegroundColor Red
    exit 1
}

# Navigate to backend directory
Set-Location $PSScriptRoot

# Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
Write-Host "`nSetting up environment variables..." -ForegroundColor Yellow
if (-Not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "[OK] Created .env file from .env.example" -ForegroundColor Green
    Write-Host "[WARNING] Please update .env file with your configuration" -ForegroundColor Yellow
} else {
    Write-Host "[INFO] .env file already exists" -ForegroundColor Blue
}

# Create necessary directories
Write-Host "`nCreating necessary directories..." -ForegroundColor Yellow
$directories = @(
    "uploads/avatars",
    "uploads/reports",
    "uploads/events",
    "uploads/zones",
    "logs"
)

foreach ($dir in $directories) {
    if (-Not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "[OK] Created directory: $dir" -ForegroundColor Green
    } else {
        Write-Host "[INFO] Directory already exists: $dir" -ForegroundColor Blue
    }
}

Write-Host "`nSetup completed successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Update the .env file with your configuration (MongoDB URI, JWT secrets, etc.)" -ForegroundColor White
Write-Host "2. Make sure MongoDB is running" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host "4. Run 'npm run build' to build for production" -ForegroundColor White
Write-Host "`nAPI will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Documentation: http://localhost:3000/health" -ForegroundColor Cyan
Write-Host "`nHappy coding!" -ForegroundColor Magenta
