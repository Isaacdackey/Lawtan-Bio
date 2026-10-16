package com.lawtan.model;

public enum FodderCropStatus {
    PLANNED("Planifiée"),
    GROWING("En croissance"),
    HARVESTING("En récolte"),
    COMPLETED("Terminée"),
    ABANDONED("Abandonnée");

    private final String label;

    FodderCropStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}