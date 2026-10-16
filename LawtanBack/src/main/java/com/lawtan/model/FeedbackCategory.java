package com.lawtan.model;

public enum FeedbackCategory {
    QUALITY("Qualité du produit"),
    FRESHNESS("Fraîcheur"),
    PACKAGING("Conditionnement"),
    DELIVERY("Livraison"),
    PRICE("Prix"),
    SERVICE("Service client"),
    OTHER("Autre");

    private final String label;

    FeedbackCategory(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}