package com.lawtan.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransformationSummaryDTO {
    private Double totalMilkTransformedLiters; // Total lait brut transformé
    private Double averageYieldEfficiency;     // Rendement moyen %
    private Long activeBatchesCount;           // Nombre de lots en cours
    private Long totalBatchesCount;            // Nombre total de lots réalisés
    private Double totalStockValueFcfa;        // Valeur totale marchande du stock de produits transformés
    private Long productsInStockCount;         // Nombre de références/unités en stock
    private Long dlcAlertsCount;               // Lots proches de la DLC (< 5 jours)
}
