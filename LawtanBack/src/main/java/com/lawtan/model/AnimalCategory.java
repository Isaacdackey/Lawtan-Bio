package com.lawtan.model;

public enum AnimalCategory {
    // Catégories officielles unifiées (CowMaster)
    VACHE("Vache"),
    GENISSE("Génisse"),
    VELLE("Velle"),
    VEAU("Veau"),
    JEUNE_MALE("Jeune mâle"),
    TAUREAU("Taureau"),

    // Rétrocompatibilité
    MILKING_COW("Vache Laitière en Production"),
    HEIFER_YOUNG("Génisse / Jeune"),
    MALE_BULL("Mâle / Taureau Reproducteur");

    private final String label;

    AnimalCategory(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}

