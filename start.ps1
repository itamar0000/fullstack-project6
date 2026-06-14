# Project 6 startup script
# Starts MySQL (if not running) then the Express API server

$mysqlBin = "C:\Program Files\MySQL\MySQL Server 8.4\bin"
$env:PATH += ";$mysqlBin"

# Start MySQL if not already running
$mysqlProc = Get-Process mysqld -ErrorAction SilentlyContinue
if (-not $mysqlProc) {
    Write-Host "Starting MySQL..." -ForegroundColor Yellow
    Start-Process -FilePath "$mysqlBin\mysqld.exe" `
        -ArgumentList "--defaults-file=C:\mysql_data\my.ini" `
        -WindowStyle Hidden
    Start-Sleep -Seconds 5
    Write-Host "MySQL started." -ForegroundColor Green
} else {
    Write-Host "MySQL already running (PID $($mysqlProc.Id))." -ForegroundColor Green
}

# Start the Express API server (foreground so you see logs)
Write-Host "Starting Express API on http://localhost:3001 ..." -ForegroundColor Cyan
Set-Location "C:\fullstack_proj6\server"
node server.js
