# Run this from the mahjong folder: .\install.ps1
Set-Location $PSScriptRoot
Write-Host "Installing client deps..." -ForegroundColor Cyan
Set-Location client
npm install
Set-Location ..
Write-Host "Installing server deps..." -ForegroundColor Cyan
Set-Location server
npm install
Set-Location ..
Write-Host "Done! Run: cd client; npm run dev" -ForegroundColor Green
