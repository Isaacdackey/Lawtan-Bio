package com.lawtan.model;

public enum InvoiceStatus {
    DRAFT,              // Brouillon
    ISSUED,             // Émise / Envoyée (En attente de règlement)
    PARTIALLY_PAID,     // Partiellement Payée (Acompte versé)
    PAID,               // Intégralement Payée / Soldée
    OVERDUE,            // En Retard de paiement
    CANCELLED           // Annulée
}
