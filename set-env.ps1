# set-env.ps1
# Tu dong lay IP LAN hien tai va ghi vao .env.local
# Su dung: .\set-env.ps1
# Hoac voi port khac: .\set-env.ps1 -Port 3002

param(
    [int]$Port = 3001
)

# Lay IP qua ipconfig (khong can quyen WMI)
$ipconfigOutput = ipconfig | Out-String
$match = [regex]::Match($ipconfigOutput, 'IPv4[^:]+:\s+([\d]{1,3}(?:\.[\d]{1,3}){3})')

if (-not $match.Success) {
    Write-Host "[ERROR] Khong tim thay IP LAN. Kiem tra ket noi mang." -ForegroundColor Red
    exit 1
}

$ip = $match.Groups[1].Value
$url = "http://${ip}:${Port}"
$content = "EXPO_PUBLIC_API_URL=$url"

Set-Content -Path ".env.local" -Value $content -Encoding UTF8

Write-Host ""
Write-Host "Da cap nhat .env.local:" -ForegroundColor Green
Write-Host "   EXPO_PUBLIC_API_URL=$url" -ForegroundColor Cyan
Write-Host ""
Write-Host "Chay lai server va expo de ap dung:" -ForegroundColor Yellow
Write-Host "   npm run server" -ForegroundColor White
Write-Host "   npx expo start --clear" -ForegroundColor White
Write-Host ""
