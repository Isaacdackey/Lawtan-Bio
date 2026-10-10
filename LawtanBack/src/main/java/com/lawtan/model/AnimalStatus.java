package com.lawtan.model;

public enum AnimalStatus {
    // Statuts officiels d'inventaire CowMaster
    ACTIF("Actif"),
    MORT("Mort"),
    MORT_NE("Mort-né"),
    VENDU("Vendu"),
    A_VERIFIER("À vérifier"),

    // Statuts zootechniques / physiologiques
    EXCELLENT("Excellente"),
    HEALTHY("Sain"),
    FEVER_TREATMENT("Fièvre / En Soin"),
    PREGNANT("Gestante"),
    IN_HEAT("Chaleurs"),
    DRY_OFF("Tarie"),
    GROWTH("En Croissance"),
    BREEDER_BULL("Reproducteur A+");

    private final String label;

    AnimalStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}

