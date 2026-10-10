package com.lawtan.model;

public enum MilkSession {
    MORNING("Matin (06h00)"),
    EVENING("Soir (17h00)");

    private final String label;

    MilkSession(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
