package com.lawtan.model;

public enum ReproEventType {
    // Événements officiels CowMaster
    INSEMINATION("Insémination"),
    PREG_CHECK("Contrôle gestation"),
    HEAT_DETECTION("Chaleurs"),
    CALVING("Vêlage"),
    DRY_OFF("Tarissement"),
    ILLNESS_TREATMENT("Maladie / Traitement"),

    // Rétrocompatibilité
    ARTIFICIAL_INSEMINATION("Insémination Artificielle (IA)"),
    NATURAL_MATING("Saillie Naturelle"),
    PREGNANCY_DIAGNOSIS("Diagnostic Gestation (Échographie)");

    private final String label;

    ReproEventType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}

