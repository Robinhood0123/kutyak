@echo off
cd /d "%~dp0"

echo Szerver inditasa...
start "Node Server" cmd /k "node server.js"

echo Varakozas a szerver indulasara...
timeout /t 2 /nobreak >nul

echo Ngrok inditasa...
ngrok config add-authtoken 38YhijREa9cMRjl7GN5nCLKw9qR_6NQeVMc8k6qioYdFYVpkW
start "Ngrok" cmd /k "ngrok http 3000"

echo Kesz! Mindket ablak elindult.

echo Oldal megnyitasa...
timeout /t 1 /nobreak >nul
start https://unantagonized-delisa-oneiric.ngrok-free.dev
