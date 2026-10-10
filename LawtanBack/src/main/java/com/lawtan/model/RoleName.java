package com.lawtan.model;

public enum RoleName {
    ROLE_MANAGER("Manager Général"),
    ROLE_TECHNICIAN("Technicien Élevage"),
    ROLE_VETERINARIAN("Vétérinaire (Dr. Fall)"),
    ROLE_ACCOUNTANT("Comptable / Ventes"),
    ROLE_HERDSMAN("Bouvier Responsable");

    private final String label;

    RoleName(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
