# ==============================================================================
# Script PowerShell de réveil et de maintien actif du backend Render
# Render (tier gratuit) s'endort après 15 minutes d'inactivité.
# ==============================================================================

$BackendUrl = "https://lawtan-bio-back-6h72.onrender.com/api/marketplace/products"
$IntervalMinutes = 10

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   LAWTAN BIO - KEEP-ALIVE RENDER BACKEND" -ForegroundColor Green
Write-Host "   Cible : $BackendUrl" -ForegroundColor Yellow
Write-Host "   Fréquence : toutes les $IntervalMinutes minutes" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

while ($true) {
    $time = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    Write-Host "[$time] Envoi du ping vers Render..." -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $BackendUrl -Method Get -TimeoutSec 45 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host " [OK 200] Backend éveillé !" -ForegroundColor Green
        } else {
            Write-Host " [Code $($response.StatusCode)] Ping transmis." -ForegroundColor Yellow
        }
    } catch {
        Write-Host " [En cours de réveil...] $($_.Exception.Message)" -ForegroundColor DarkYellow
    }
    
    Start-Sleep -Seconds ($IntervalMinutes * 60)
}
