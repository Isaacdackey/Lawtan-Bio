#!/bin/bash
# ==============================================================================
# Script de réveil et de maintien actif du backend Render
# Render (tier gratuit) s'endort après 15 minutes d'inactivité.
# Ce script envoie un ping toutes les 10 minutes.
# ==============================================================================

BACKEND_URL="https://lawtan-bio-back-6h72.onrender.com/api/marketplace/products"
INTERVAL_SECONDS=600 # 10 minutes

echo "=========================================================="
echo "   LAWTAN BIO - KEEP-ALIVE RENDER BACKEND"
echo "   Cible : $BACKEND_URL"
echo "   Fréquence : toutes les 10 minutes"
echo "=========================================================="

while true; do
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
    echo "[$TIMESTAMP] Envoi de la requête de réveil..."
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 45 "$BACKEND_URL" 2>/dev/null || echo "TIMEOUT")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "[$TIMESTAMP] ✅ Backend Render éveillé et actif (HTTP 200)."
    else
        echo "[$TIMESTAMP] ⏳ Ping envoyé (Réponse : $HTTP_CODE). L'instance redémarre ou répond."
    fi
    
    sleep $INTERVAL_SECONDS
done
