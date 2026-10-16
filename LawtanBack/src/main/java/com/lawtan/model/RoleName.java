package com.lawtan.model;

import java.util.Arrays;
import java.util.Optional;

public enum RoleName {
    MANAGER("manager", "Directeur Général", "#059669", "Direction Générale"),
    VETERINARIAN("veto", "Vétérinaire Chef", "#0284c7", "Santé & Reproduction"),
    TECHNICIAN("tech", "Technicien Élevage", "#d97706", "Production & Laiterie"),
    ACCOUNTANT("compta", "Comptable", "#7c3aed", "Finances & Comptabilité"),
    COMMERCIAL("commercial", "Commercial", "#db2777", "Commercial & Ventes"),
    HERDSMAN("bouvier", "Bouvier", "#16a34a", "Élevage & Énergie");

    private final String code;
    private final String label;
    private final String badgeColor;
    private final String defaultDepartment;

    RoleName(String code, String label, String badgeColor, String defaultDepartment) {
        this.code = code;
        this.label = label;
        this.badgeColor = badgeColor;
        this.defaultDepartment = defaultDepartment;
    }

    public String getCode() { return code; }
    public String getLabel() { return label; }
    public String getBadgeColor() { return badgeColor; }
    public String getDefaultDepartment() { return defaultDepartment; }

    public String authority() {
        return "ROLE_" + code.toUpperCase();
    }

    public static Optional<RoleName> fromCode(String code) {
        if (code == null) return Optional.empty();
        String normalized = code.trim().toLowerCase();
        return Arrays.stream(values()).filter(r -> r.code.equals(normalized)).findFirst();
    }
}