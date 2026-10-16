package com.lawtan.model;

public enum FeedbackSource {
    PHONE("Téléphone"),
    FARM_VISIT("Visite / vente directe"),
    MARKETPLACE("Marketplace"),
    EMAIL("Email"),
    OTHER("Autre");

    private final String label;

    FeedbackSource(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}