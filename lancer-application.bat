@echo off
chcp 65001 > nul
title FERME LAWTAN BIO - Démarrage Complet (Backend + Frontend)

set "ROOT_DIR=%~dp0"

echo ===============================================================================
echo            🌾 FERME LAWTAN AGRO INDUSTRIES - SYSTÈME DE GESTION 🌾
echo ===============================================================================
echo.

:: 1. Démarrage du Backend avec le wrapper Maven officiel
echo [1/2] Démarrage du serveur Backend Spring Boot (port 8080)...
start "LAWTAN BACKEND (Spring Boot :8080)" cmd.exe /k "cd /d "%ROOT_DIR%LawtanBack" && .\mvnw.cmd spring-boot:run"

echo.
:: 2. Démarrage du Frontend Angular
echo [2/2] Démarrage du Frontend Angular (port 4200)...
start "LAWTAN FRONTEND (Angular :4200)" cmd.exe /k "cd /d "%ROOT_DIR%LawtanFront" && npm start"

echo.
echo ===============================================================================
echo  ✅ Les deux terminaux de démarrage sont ouverts :
echo.
echo  • Backend API : http://localhost:8080/api
echo  • Application Web : http://localhost:4200
echo ===============================================================================
echo.
pause
