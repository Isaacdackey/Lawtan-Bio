@echo off
chcp 65001 > nul
title FERME LAWTAN BIO - Démarrage Complet (Backend + Frontend)

echo ===============================================================================
echo            🌾 FERME LAWTAN AGRO INDUSTRIES - SYSTÈME DE GESTION 🌾
echo ===============================================================================
echo.
echo [1/2] Démarrage du serveur Backend Spring Boot (API & PostgreSQL sur le port 8080)...
start "LAWTAN BACKEND (Spring Boot :8080)" /D "%~dp0LawtanBack" cmd /k "if not exist target\lawtan-back-0.0.1-SNAPSHOT.jar call mvnw.cmd package -DskipTests & java -jar target\lawtan-back-0.0.1-SNAPSHOT.jar"

echo.
echo [2/2] Démarrage du Frontend Angular (Interface Web sur le port 4200)...
start "LAWTAN FRONTEND (Angular :4200)" /D "%~dp0LawtanFront" cmd /k "npm start"

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
