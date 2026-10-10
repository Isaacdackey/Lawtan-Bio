package com.lawtan.dto;

import lombok.*;

import java.util.List;

/**
 * Synthèse financière calculée exclusivement à partir des données réelles en base :
 * factures émises (recettes), soins vétérinaires et distributions d'aliment (charges).
 * Aucune valeur n'est estimée ni forfaitaire : un poste sans donnée vaut 0.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinanceSummaryDTO {

    private String periodLabel;          // ex: "Septembre 2026"
    private String periodStart;          // ISO yyyy-MM-dd
    private String periodEnd;            // ISO yyyy-MM-dd

    private Double totalRevenueFcfa;     // Recettes facturées sur la période
    private Double totalCollectedFcfa;   // Recettes réellement encaissées
    private Double totalChargesFcfa;     // Somme des postes de charges tracés
    private Double netProfitFcfa;        // Recettes - Charges
    private Double netMarginPercentage;  // Marge nette %

    private Double milkLitersProduced;   // Lait collecté sur la période
    private Double costPerLiterFcfa;     // Coût de revient au litre (charges / litres)

    private Integer invoicesCount;       // Nombre de factures non annulées sur la période

    private List<CostLine> costBreakdown;     // Structure des charges par poste
    private List<MonthPoint> monthlySeries;   // 6 derniers mois : recettes vs charges

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CostLine {
        private String label;        // ex: "Alimentation & Fourrage"
        private String source;       // Table d'origine, pour la transparence de l'audit
        private Double amountFcfa;
        private Double percentage;   // Part dans le total des charges
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthPoint {
        private String label;        // ex: "Avr"
        private String month;        // ISO yyyy-MM
        private Double revenueFcfa;
        private Double chargesFcfa;
    }
}
