@echo off
chcp 65001 > nul
title FERME LAWTAN BIO - Démarrage Complet (Backend + Frontend)

echo ===============================================================================
echo            🌾 FERME LAWTAN AGRO INDUSTRIES - SYSTÈME DE GESTION 🌾
echo ===============================================================================
echo.
echo [1/2] Démarrage du serveur Backend Spring Boot (API & PostgreSQL sur le port 8080)...
start "LAWTAN BACKEND (Spring Boot :8080)" cmd /k "cd /d "%~dp0LawtanBack" && if exist "%~dp0.env" (for /f "usebackq tokens=1,* eol=# delims==" %%A in ("%~dp0.env") do set "%%A=%%B") && mvnw.cmd spring-boot:run"

echo.
echo [2/2] Démarrage du Frontend Angular (Interface Web sur le port 4200)...
start "LAWTAN FRONTEND (Angular :4200)" cmd /k "cd /d "%~dp0LawtanFront" && npm start"

echo.
echo ===============================================================================
echo  ✅ Les deux serveurs sont en cours de lancement dans des fenêtres séparées !
echo.
echo  • Backend API : http://localhost:8080/api/animals
echo  • Base de Données : Neon PostgreSQL Cloud (Connectée)
echo  • Application Web : http://localhost:4200
echo ===============================================================================
echo.
pause
