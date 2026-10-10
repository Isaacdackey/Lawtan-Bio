package com.lawtan.model;

public enum BatchStatus {
    PLANNED,      // Ordre de fabrication planifié
    IN_PROGRESS,  // En cours de transformation (Maturation, Fermentation, Égouttage, Pasteurisation)
    COMPLETED,    // Transformation terminée et produit stocké
    CANCELLED     // Lot annulé ou rejeté
}
